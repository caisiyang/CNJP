import os
import json
from googleapiclient.discovery import build
import datetime

# -------------------------------------------------------------
# Configuration
# -------------------------------------------------------------
yt_token = os.environ.get("YOUTUBE_" + "API_KEY")
CONFIG_FILE = "scripts/stream_config.json"
OUTPUT_FILE = "public/live_data.json"

def load_stream_config():
    """加载直播源配置"""
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def calculate_match_score(title, keywords):
    """
    计算标题的匹配分数，包含的关键词越多分数越高
    """
    score = 0
    title_lower = title.lower()
    
    for keyword in keywords:
        if keyword.lower() in title_lower:
            score += 1
    
    return score

def get_live_stream_for_channel(youtube, channel_id, keywords, channel_name):
    """
    获取指定频道的直播源
    """
    try:
        print(f"\n🔍 Searching channel: {channel_name} ({channel_id})")
        print(f"   Keywords: {keywords}")
        
        # 搜索该频道的所有直播
        request = youtube.search().list(
            part="id,snippet",
            channelId=channel_id,
            eventType="live",
            type="video",
            maxResults=50
        )
        response = request.execute()
        items = response.get("items", [])

        if not items:
            print(f"   ⚠️ No live streams found")
            return None

        print(f"   📺 Found {len(items)} active streams")
        
        # 为每个视频计算匹配分数
        scored_videos = []
        for video in items:
            title = video["snippet"]["title"]
            video_id = video["id"]["videoId"]
            score = calculate_match_score(title, keywords)
            
            scored_videos.append({
                "title": title,
                "video_id": video_id,
                "score": score
            })

        # 按分数排序
        scored_videos.sort(key=lambda x: x["score"], reverse=True)
        best_match = scored_videos[0]
        
        if best_match["score"] > 0:
            print(f"   ✅ Best match (score {best_match['score']}): {best_match['title'][:60]}...")
        else:
            print(f"   ⚠️ No keyword match, using first available: {best_match['title'][:60]}...")
        
        return {
            "videoId": best_match["video_id"],
            "title": best_match["title"],
            "matchScore": best_match["score"]
        }
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def update_all_streams(api_key):
    """
    更新所有直播源
    """
    config = load_stream_config()
    youtube = build("youtube", "v3", developerKey=api_key)
    
    results = {
        "lastUpdated": datetime.datetime.now().isoformat(),
        "streams": []
    }
    
    print("=" * 80)
    print("🚀 Updating all live streams...")
    print("=" * 80)
    
    for stream_config in config["streams"]:
        stream_id = stream_config["id"]
        display_name = stream_config["displayName"]
        channel_id = stream_config["channelId"]
        channel_name = stream_config["channelName"]
        keywords = stream_config["keywords"]
        
        stream_data = get_live_stream_for_channel(
            youtube, 
            channel_id, 
            keywords, 
            channel_name
        )
        
        if stream_data:
            results["streams"].append({
                "id": stream_id,
                "displayName": display_name,
                "channelName": channel_name,
                "isLive": True,
                "videoId": stream_data["videoId"],
                "title": stream_data["title"],
                "matchScore": stream_data["matchScore"]
            })
        else:
            # 没有找到直播，标记为离线
            results["streams"].append({
                "id": stream_id,
                "displayName": display_name,
                "channelName": channel_name,
                "isLive": False,
                "videoId": None,
                "title": None,
                "matchScore": 0
            })
    
    return results

def save_to_json(data, filename):
    """保存数据到 JSON 文件"""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"💾 Data saved to {filename}")
    print("=" * 80)
    print("\n📊 Summary:")
    for stream in data["streams"]:
        status = "🟢 LIVE" if stream["isLive"] else "🔴 OFFLINE"
        print(f"  {status} {stream['displayName']}")
        if stream["isLive"]:
            print(f"       Video ID: {stream['videoId']}")
    print("=" * 80)

if __name__ == "__main__":
    if not yt_token:
        raise ValueError("❌ Error: Missing YouTube API key!")
    
    try:
        data = update_all_streams(yt_token)
        save_to_json(data, OUTPUT_FILE)
        print("\n✨ Done.")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        raise