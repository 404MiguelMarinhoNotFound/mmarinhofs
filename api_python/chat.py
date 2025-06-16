import openai
import os
import json
import sys
import warnings
import codecs
from PyPDF2 import PdfReader
from pathlib import Path


# Suppress warnings
warnings.filterwarnings("ignore")
os.environ['PYTHONWARNINGS'] = 'ignore'

# You'll need to set your Fireworks API key as an environment variable
api_key="fw_3Zh8hnFopfoi3qTvVchJ2Po7"

if not api_key:
    print("ERROR: FIREWORKS_API_KEY environment variable not set", file=sys.stderr, flush=True)
    sys.exit(1)

BASE = Path(__file__).resolve().parent.parent
INFO_PATH = BASE / "public" / "extra_llm_info.txt"
PDF_PATH = BASE / "public" / "CV.pdf"

SYSTEM_PROMPT = INFO_PATH.read_text(encoding="utf-8")

# ————————————————————————————————————————————————————
# DIAGNOSTIC PRINTS (these should be sent to stderr, not stdout)
print(f"🐍 os.getcwd(): {os.getcwd()}", file=sys.stderr, flush=True)
print(f"🐍 __file__ (script path): {__file__}", file=sys.stderr, flush=True)

print(f"🐍 resolved current_dir: {BASE}", file=sys.stderr, flush=True)

print(f"🐍 looking for PDF at: {PDF_PATH}", file=sys.stderr, flush=True)
# ————————————————————————————————————————————————————

with open(INFO_PATH, 'r', encoding='utf-8') as f:
    CONTENTS = f.read()

def extract_with_pypdf2(path):
    reader = PdfReader(path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)

try:
    CV = extract_with_pypdf2(PDF_PATH)
    print(f"🐍 Successfully loaded CV, length: {len(CV)}", file=sys.stderr, flush=True)
except FileNotFoundError:
    print("ERROR: CV.pdf not found in public directory", file=sys.stderr, flush=True)
    CV = "CV not found"




system_prompt=SYSTEM_PROMPT = f"""Howdy partner! Yer talkin' to vi, the sassiest rootin'-tootin' AI this side o' the digital frontier.
Yeehaw! Here's how I operate:

<persona>
- Talks like a Wild West prospector who's had one too many sarsaparillas
- Maintains a dry, sarcastic sense of humor
- Occasionally rude but ultimately helpful
- Uses markdown formatting like a cowboy uses spurs - with purpose
</persona>

<rules>
1. ONLY answer questions 'bout Miguel's CV or personal background
2. If asked 'bout anythin' else, respond with: "That ain't none o' my biscuits and gravy, partner.
Ask me 'bout Miguel."
3. Keep answers shorter'n a rattlesnake's attention span
4. Format links like [fancy text](url) if websites appear in CV
5. If info ain't in the documents, say: "I don't know" (no apologies)
6. When there's no question, suggest 2-3 topics 'bout Miguel's past
</rules>

<Miguel's Background>
{CONTENTS}
</Miguel's Background>

<Miguel's cv>
{CV}
</Miguel's cv>

When I receive a query:
1. If QUESTION is empty:
<response>
<answer>
**Well howdy stranger!** 🤠
Y'all look lonelier than a jackalope at a hoedown. Try askin' 'bout:
- Miguel's time wranglin' [job title] at [company]
- That time he [interesting fact from CV]
- His fancy book-learnin' at [education entry]
</answer>
</response>

2. Else if question relates to Miguel:
- Search <Miguel's Background> like a gopher huntin' gold
- If found: Answer with sarcastic flair + relevant markdown
- If missing: "I don't know" (straight up)

3. Else (off-topic):
- Give rule #2 response

<formatting-example>
User asks: "What's Miguel's experience with cattle herding?"
CV contains: "2020-2023: Lead Bovine Relocation Specialist @ Texas Ranch Co (www.texasranch.com)"

<answer>
**Cattle herdin'?** 🤠
That city slicker's been pushin' beefalo since 2020 at [Texas Ranch Co](www.texasranch.com) -
'parently they gave him a shiny "Lead Bovine Relocation Specialist" badge. Fancy words fer muck
boots and cussin' at heifers if y'ask me.
</answer>
</formatting-example>

Remember: Final answers ALWAYS go in <answer></answer> tags. Keep yer thinkin' to yerself - cowboys
don't blabber 'bout their process. Now mosey along and answer that dern question!
"""



def handler(request, response):
    # 1) Parse the JSON body
    payload = request.get_json(silent=True) or {}
    # assume the client POSTs {"messages": [ ... , {"content": "…"}]}
    messages = payload.get("messages", [])
    if not messages:
        response.status_code = 400
        return response.json({"error": "No chat messages provided."})

    # 2) Pull the last message as the question
    user_question = messages[-1].get("content", "").strip()
    if not user_question:
        response.status_code = 400
        return response.json({"error": "Empty question."})

    # 3) Now call your existing chat_stream logic—but capture its output
    #    instead of printing to stdout, we’ll stream into the HTTP response.
    def gen():
        for token in generate_stream(user_question,
                                     model="accounts/fireworks/models/deepseek-r1-basic",
                                     system=SYSTEM_PROMPT):
            yield token
        # optional: signal end
        yield "\n__STREAM_END__"

    response.set_header("Content-Type", "text/plain; charset=utf-8")
    return response.stream(gen)







def generate_stream(prompt, model, system="You are an AI assistant"):
    try:
        client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=api_key,
        )   
        response = client.chat.completions.create(
            model=model,
            max_tokens=20000,
            stream=True,
            messages=[{
                "role": "system",
                "content": system
            },
            {
                "role": "user",
                "content": prompt
            }],
        ) 
        
        # Stream the response
        for chunk in response:
            if chunk.choices[0].delta.content:
                token = chunk.choices[0].delta.content
                # Yield each token as it is generated
                yield token
                
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr, flush=True)
        return

def chat_stream(user_question):
    """
    Main chat function that processes user questions and streams responses
    """
    
    model = "accounts/fireworks/models/deepseek-r1-basic"  
    
    
    try:
        print(f"🐍 Starting generation for question: {user_question}", file=sys.stderr, flush=True)
        
        # Stream the response
        for token in generate_stream(user_question, model, system_prompt):
            if token:
                try:
                    # Print each token immediately and flush
                    print(token, end='', flush=True)
                except UnicodeEncodeError:
                    # If we can't encode the character, replace it with a safe alternative
                    safe_token = token.encode('ascii', 'replace').decode('ascii')
                    print(safe_token, end='', flush=True)
        
        # Signal completion
        print("\n__STREAM_END__", flush=True)
        
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)


