from flask import Flask, render_template, request, session
app = Flask('app')
project_list={0:"ok"}
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

@app.route('/create/')
def createproject_page():
  pass

app.run(host='0.0.0.0', port=8080)