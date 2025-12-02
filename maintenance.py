import json
import os
import datetime
# 直接引用 main.py 里的函数，确保逻辑一致
from main import is_false_positive, classify_news, get_clean_title_key, JST

def run_maintenance():
    archive_dir = "public/archive"
    if not os.path.exists(archive_dir):
        print("未找到 archive 目录")
        return

    print("=== 开始全量数据维护 (清洗 + 重分类) ===")
    
    files = sorted([f for f in os.listdir(archive_dir) if f.endswith(".json")])
    
    total_deleted = 0
    total_reclassified = 0
    
    # 1. 遍历所有存档文件
    for filename in files:
        filepath = os.path.join(archive_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_count = len(data)
        cleaned_data = []
        
        file_reclassified_count = 0
        
        for item in data:
            # 兼容字段
            title_ja = item.get('title_ja') or item.get('original_title') or item.get('title')
            source = item.get('origin') or ""
            title_zh = item.get('title')

            # --- A. 清洗逻辑 ---
            if is_false_positive(title_ja, source):
                print(f"  [删除] {title_ja}")
                continue # 跳过这条，即删除
            
            # --- B. 重分类逻辑 ---
            old_cat = item.get('category')
            # 用新的规则计算分类
            new_cat = classify_news(title_zh)
            
            if old_cat != new_cat:
                item['category'] = new_cat
                file_reclassified_count += 1
                # print(f"  [重分类] {old_cat} -> {new_cat}: {title_zh[:10]}...")
            
            cleaned_data.append(item)
        
        # 统计
        deleted_count = original_count - len(cleaned_data)
        total_deleted += deleted_count
        total_reclassified += file_reclassified_count
        
        # 只要有变动（删除了 或者 重分类了），就写入文件
        if deleted_count > 0 or file_reclassified_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
            print(f"已处理 {filename}: 删除 {deleted_count} 条, 重分类 {file_reclassified_count} 条")
        else:
            print(f"跳过 {filename}: 无需变动")

    print(f"\n=== 维护完成 ===")
    print(f"共删除无效新闻: {total_deleted} 条")
    print(f"共重分类新闻: {total_reclassified} 条")

    # 2. 强制重建首页 data.json
    print("\n正在重建首页 data.json ...")
    
    homepage_news = []
    seen_titles = set()
    today = datetime.datetime.now(JST)
    # 取最近2天的数据
    target_dates = [
        today.strftime("%Y-%m-%d"),
        (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    ]
    
    for date_str in target_dates:
        path = os.path.join(archive_dir, f"{date_str}.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                day_data = json.load(f)
                for item in day_data:
                    raw_title = item.get('title_ja') or item.get('original_title') or item.get('title') or ""
                    clean_key = get_clean_title_key(raw_title)
                    if clean_key not in seen_titles:
                        homepage_news.append(item)
                        seen_titles.add(clean_key)
    
    homepage_news.sort(key=lambda x: x['timestamp'], reverse=True)
    
    output_data = {
        "last_updated": today.strftime("%Y年%m月%d日 %H时%M分"),
        "news": homepage_news
    }
    
    with open('public/data.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"首页数据重建完成，包含 {len(homepage_news)} 条新闻。")

if __name__ == "__main__":
    run_maintenance()