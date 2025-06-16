import openai
import os
import json
import sys
import warnings
import codecs
import subprocess
try:
    from PyPDF2 import PdfReader
except ModuleNotFoundError:
    # Install the missing package
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    # Retry the import
    from PyPDF2 import PdfReader
from pathlib import Path

# Set UTF-8 encoding for stdout to handle Unicode characters
if sys.platform == "win32":
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ['PYTHONWARNINGS'] = 'ignore'

# You'll need to set your Fireworks API key as an environment variable
api_key="fw_3Zh8hnFopfoi3qTvVchJ2Po7"

if not api_key:
    print("ERROR: FIREWORKS_API_KEY environment variable not set", file=sys.stderr, flush=True)
    sys.exit(1)

# ————————————————————————————————————————————————————
# DIAGNOSTIC PRINTS (these should be sent to stderr, not stdout)
print(f"🐍 os.getcwd(): {os.getcwd()}", file=sys.stderr, flush=True)
print(f"🐍 __file__ (script path): {__file__}", file=sys.stderr, flush=True)

current_dir = Path(__file__).resolve().parent
print(f"🐍 resolved current_dir: {current_dir}", file=sys.stderr, flush=True)

pdf_path = current_dir.parent / "public" / "CV.pdf"
print(f"🐍 looking for PDF at: {pdf_path}", file=sys.stderr, flush=True)
# ————————————————————————————————————————————————————

info_path = current_dir.parent / "public" / "extra_llm_info.txt"
with open(info_path, 'r', encoding='utf-8') as f:
    CONTENTS = f.read()

def extract_with_pypdf2(path):
    reader = PdfReader(path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)

try:
    CV = extract_with_pypdf2(pdf_path)
    print(f"🐍 Successfully loaded CV, length: {len(CV)}", file=sys.stderr, flush=True)
except FileNotFoundError:
    print("ERROR: CV.pdf not found in public directory", file=sys.stderr, flush=True)
    CV = "CV not found"

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
    system_prompt = f"""Howdy partner! Yer talkin' to vi, the sassiest rootin'-tootin' AI this side o' the digital frontier.
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

if __name__ == "__main__":
    # Get the user question from stdin
    try:
        user_question = input().strip()
        print(f"🐍 Received question: {user_question}", file=sys.stderr, flush=True)
        
        if user_question:
            chat_stream(user_question)
        else:
            print("ERROR: No user question provided", file=sys.stderr, flush=True)
            sys.exit(1)
    except EOFError:
        print("ERROR: No input provided (EOFError)", file=sys.stderr, flush=True)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)
