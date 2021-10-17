from flask import Flask, render_template, request, session, redirect, url_for, jsonify
# import os
app = Flask('app')

# SET TO FALSE BEFORE COMMITING
testing=True


# session_secret = os.environ['session-secret']
class project:
  def __init__(self, creator, hash, name="Untitled Project", desciption="",license="CC0"):
    self.name=name
    self.description=desciption
    self.creator=creator
    if not license in ["CC0", "GPL3", "CCBYSA", "MIT",]:
      print("Error! Invalid License! Setting License to CC0")
      self.license="CC0"
    else:
      self.license=license
    self.hash=hash
    self.sourceurl=f"https://dweb.link/ipfs/{hash}"
    self.playerurl=f"https://turbowarp.org/embed?project_url={self.sourceurl}"

@app.route('/')
def home():
  return render_template('index.html')
  
@app.route('/project/<int:project_number>/')
def project_page(project_number):
  if 0 <= project_number < len(project_list):
    return render_template('project.html', project_number=project_number, url_for_project=project_list[project_number].playerurl, project=project_list[project_number])
  else:
        return render_template('project-404.html', project_number=project_number)

@app.route('/create/', methods=['GET', 'POST'])
def createproject_page():
  if request.method == 'POST':
    newProject = project("system", request.form['hash'], name = request.form["name"], license="CC0", desciption=request.form["description"])
    if newProject not in project_list:
      project_list.append(newProject)
      return redirect(url_for('project_page', project_number=project_list.index(newProject)))
    else:
      return '''
      Error! Project already exists
      '''
  return render_template('create.html')

# API
@app.route("/api/")
def api_root():
  return jsonify(status="200")

@app.route("/api/getprojectsource/<int:project_number>")
def src_api(project_number):
  if 0 <= project_number < len(project_list):
    return jsonify(status="200",url=project_list[project_number].sourceurl)
  else:
    return jsonify(status="404",error="Project does not exist")


if testing:
  test_project = project("system", "Qmf9gTkEhVneVzjzLeTHqdaGBN2tERqm5jFzpxiNKF6SJB", name = "Test Project", license="CC0", desciption="This is a test project. Notify the admins if you see this project on a production server.")
  project_list=[]
  project_list.append(test_project)
else:
  project_list=[]


app.run(host='0.0.0.0', port=8080)
# TESTING CODE 