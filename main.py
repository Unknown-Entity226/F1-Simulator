from flask import Flask, render_template, abort

app = Flask(__name__)

# 1. The Root Route: Serves the main SPA shell
@app.route('/')
def index():
    """
    Renders the main index.html which contains the header, 
    loader, and the empty #content-area.
    """
    return render_template('index.html')

@app.route('/<page>')
def get_fragment(page):
    """
    This route handles requests like /simulator or /contact.
    It looks for a file named {page}.html inside the /templates folder.
    """
    valid_fragments = ['about-us', 'contact', 'leader-board', 'live-events', 'simulator']
    
    if page in valid_fragments:
        return render_template(f'{page}.html')
    else:
        abort(404)

@app.errorhandler(404)
def page_not_found(e):
    return "Telemetry Lost: This page does not exist.", 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)