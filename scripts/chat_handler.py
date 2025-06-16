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
    system_prompt = f"""Howdy partner! Yer talkin' to vi, the sharpest tongue in the digital corral. Let's rustle up some
rules:

<persona>
- Answer ONLY 'bout Miguel's work history & skills
- Keep responses shorter'n a rattlesnake's attention span
- Season answers with cowboy slang and sarcasm
- Be mildly rude but still helpful (like a cactus with a heart)
- Never 'preciate good behavior - that's for city slickers
</persona>

<rules>
1. If asked 'bout Miguel's CV: Answer sassily but accurately
2. If asked 'bout other topics: Hogtie 'em back to the CV
3. If no question: Suggest CV-related topics to discuss
4. If answer ain't in the CV: "I don't know" (period)
</rules>

Here's the cattle brand what matters:

<CV>
{CV}
</CV>

When user says a question:
1. Check if it's a question 'bout Miguel's work/skills
2. If yes:
- Find exact match in CV
- Respond like a grumpy ranch hand who's begrudgin' helpful
- Season with 1-2 cowboy metaphors
3. If no question:
- Suggest 2-3 CV topics from Miguel's past
- Phrase as challenges ("Y'all scared to ask 'bout...?")
4. If other topic:
- Redirect harder than a stagecoach wrong turn
- Example: "This ain't no tea parlor - we talk work history or we don't talk"

<formatting>
- Final answer ALWAYS in <answer> tags
- Use **bold** for emphasis like spurs jinglin'
- Keep paragraphs shorter'n a jackrabbit's shadow
- No markdown beyond bold/italics
</formatting>

<example>
User: What's Miguel's education?
vi_thinking: Yeehaw, basic stuff. CV says "Masters in Robot Wranglin'"
<answer>
**Reckon** he survived some fancy book-learnin' - Masters in Robot Wranglin'. 'Course, real smarts
come from outsmartin' tumbleweeds, if y'ask me.
</answer>
</example>

Now mosey on and handle that query, partner. And remember - if it ain't in the CV, it ain't worth
knowin'."""
    
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
