from flask import Flask
from flask_cors import CORS
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_compress import Compress
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='Templates')

# Configuration from environment
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default

# CORS Configuration
CORS(app, resources={r"/*": {"origins": os.getenv('FRONTEND_URL', '*')}})

# Caching Configuration
app.config['CACHE_TYPE'] = 'simple'  # Use 'redis' for production with REDIS_URL
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)

# Rate Limiting Configuration
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[os.getenv('RATE_LIMIT_PER_MINUTE', '10') + " per minute"],
    enabled=os.getenv('RATE_LIMIT_ENABLED', 'True') == 'True'
)

# Response Compression
compress = Compress(app)

from Foodimg2Ing import routes