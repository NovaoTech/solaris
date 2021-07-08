from flask import Flask, render_template, request, session, redirect, url_for
# import os
app = Flask('app')
project_list=[]
# session_secret = os.environ['session-secret']
class project:
  def __init__(self, creator, name="Untitled Project", desciption="",license="CC0"):
    self.name=name
    self.description=desciption
    self.creator=creator
    if not license in ["CC0", "GPL3", "CCBYSA", "MIT",]:
      print("Error! Invalid License! Setting License to CC0")
      self.license="CC0"
    else:
      self.license=license


@app.route('/')
def home():
  return render_template('index.html')
  
@app.route('/project/<int:project_number>/')
def project_page(project_number):
  if project_number in project_list:
    return render_template('project.html', project_number=project_number)
  else:
        return render_template('project-404.html', project_number=project_number)

@app.route('/create/', methods=['GET', 'POST'])
def createproject_page():
  if request.method == 'POST':
    newProject = project("system", name = request.form["name"], license="CC0", desciption=request.form["description"])
    project_list.append(newProject)
    return redirect(url_for('project_page', project_number=project_list.index(newProject)))
  return '''
        <form method="post">
            <input type=text name=name placeholder="Project Name"><br>
            <input type=text name=description placeholder="Description">
            <br>
            <input type=submit value=Create>
        </form>
    '''

app.run(host='0.0.0.0', port=8080)