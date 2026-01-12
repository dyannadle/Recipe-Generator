import pytest
from Foodimg2Ing import app

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_endpoint(client):
    """Test the home endpoint returns active status"""
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'active'
    assert 'Recipe Generator API' in data['message']

def test_predict_no_file(client):
    """Test predict endpoint without file returns 400"""
    response = client.post('/predict')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_predict_empty_filename(client):
    """Test predict endpoint with empty filename returns 400"""
    response = client.post('/predict', data={'imagefile': (None, '')})
    assert response.status_code == 400
