from flask import Flask, render_template

app = Flask(__name__)

# 1. The "Catch-All" Route
# This ensures that if you reload on /simulator, it still sends index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # If the JS is asking for a fragment, serve the HTML snippet
    if path.startswith('get-content/'):
        page = path.replace('get-content/', '')
        try:
            return render_template(f'{page}.html')
        except:
            return "Fragment not found", 404
            
    # For everything else (Direct browser entry/reload), serve the main shell
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)