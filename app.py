from flask import Flask, request, jsonify
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel

app = Flask(__name__)

# Load model and tokenizer (adjust paths if needed)
model_path = "./monamiV1"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = GPT2Tokenizer.from_pretrained(model_path)
model = GPT2LMHeadModel.from_pretrained(model_path)
model.to(device)
model.eval()

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    # Encode prompt
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    
    # Generate response (you can adjust max_length and other params)
    outputs = model.generate(inputs, max_length=50, num_return_sequences=1, pad_token_id=tokenizer.eos_token_id)
    
    # Decode generated text (skip the prompt part)
    reply = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)
    
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
