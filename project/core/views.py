from flask import render_template, Blueprint
from cryptography.fernet import Fernet 


# Blueprint for core
core = Blueprint('core', __name__, template_folder='templates', static_folder='static')


# Route to homepage
@core.route('/')
def index():
    print('Homepage accessed')
    key = Fernet.generate_key()
    f = Fernet(key)
    return render_template('index.html')
