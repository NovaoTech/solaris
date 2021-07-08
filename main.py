from flask import Flask, render_template
app = Flask('app')

@app.route('/')
def home():
  return render_template('index.html')
@app.route('/assets/<file>')
def staticfile():
  return url_for('static', filename=escape(file))
app.run(host='0.0.0.0', port=8080)