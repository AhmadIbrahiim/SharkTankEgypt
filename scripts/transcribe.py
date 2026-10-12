# Transcribes the show's official TikTok clips and YouTube pitch videos (Arabic) so pitch outcomes can be read from what the
# sharks say on air. Usage (in Actions): python3 scripts/transcribe.py <targets.json> <out.json> <shard> <shards>
import json, subprocess, sys, os, time
import numpy as np
from faster_whisper import WhisperModel

targets, out_path, shard, shards = json.load(open(sys.argv[1])), sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
model = WhisperModel('small', compute_type='int8')
# Resume: keep what an earlier run already transcribed and skip those videos.
out = [r for r in json.load(open(out_path)) if r.get('text')] if os.path.exists(out_path) else []
done = {r['url'] for r in out}
for i, t in enumerate(targets):
    if i % shards != shard or t['url'] in done:
        continue
    r = dict(t)
    try:
        # YouTube blocks GitHub's servers unless signed in (YOUTUBE_COOKIES secret, written to /tmp/cookies.txt).
        auth = ['--cookies', '/tmp/cookies.txt'] if os.path.exists('/tmp/cookies.txt') else []
        subprocess.run(['yt-dlp', *auth, '--impersonate', 'chrome', '-f', 'bestaudio/best', '-o', '/tmp/clip.media', '--force-overwrites', t['url']],
                       check=True, capture_output=True, timeout=120)
        # Decode with ffmpeg to 16 kHz mono floats; faster-whisper's own decoder breaks on mismatched PyAV versions.
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', '/tmp/clip.media', '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'],
                             check=True, capture_output=True, timeout=120).stdout
        segs, _ = model.transcribe(np.frombuffer(pcm, np.float32), language='ar', vad_filter=True)
        r['text'] = ' '.join(s.text.strip() for s in segs)
    except subprocess.CalledProcessError as e:
        r['error'] = (e.stderr or b'').decode(errors='replace')[-400:]
    except Exception as e:
        r['error'] = str(e)[:300]
    out.append(r)
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)  # after each clip: a killed job keeps what it did
    time.sleep(3)  # TikTok throttles bursts
    print(i, t['id'], len(r.get('text', '')), r.get('error', '')[:80], flush=True)
