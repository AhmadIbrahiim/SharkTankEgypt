# Transcribes the show's official TikTok clips (Arabic) so pitch outcomes can be read from what the
# sharks say on air. Usage (in Actions): python3 scripts/transcribe.py <targets.json> <out.json> <shard> <shards>
import json, subprocess, sys, os, time
from faster_whisper import WhisperModel

targets, out_path, shard, shards = json.load(open(sys.argv[1])), sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
model = WhisperModel('small', compute_type='int8')
out = []
for i, t in enumerate(targets):
    if i % shards != shard:
        continue
    r = dict(t)
    try:
        subprocess.run(['yt-dlp', '--impersonate', 'chrome', '-f', 'bestaudio/best', '-o', '/tmp/clip.media', '--force-overwrites', t['url']]  # no ffmpeg on the runner: Whisper decodes the video itself,
                       check=True, capture_output=True, timeout=120)
        segs, _ = model.transcribe('/tmp/clip.media', language='ar', vad_filter=True)
        r['text'] = ' '.join(s.text.strip() for s in segs)
    except subprocess.CalledProcessError as e:
        r['error'] = (e.stderr or b'').decode(errors='replace')[-400:]
    except Exception as e:
        r['error'] = str(e)[:300]
    out.append(r)
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)  # after each clip: a killed job keeps what it did
    time.sleep(3)  # TikTok throttles bursts
    print(i, t['id'], len(r.get('text', '')), r.get('error', '')[:80], flush=True)
