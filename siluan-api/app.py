from flask import Flask, jsonify, abort, make_response, request
import json
import numpy as np
import pymongo
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["mongo_1"]

 
app = Flask(__name__)

@app.route('/siluan/api/v1.0/getusers', methods=['POST'])
def upload_info():
    user_info = request.get_json()
    user_name = user_info['user']
    user_password = user_info['password']
    mycol = mydb["users"]
    mydoc = mycol.find(user_info)
    if mydoc.count()>0:
        return '1'
    else:
        que=mycol.find({'user':user_name})
        if que.count() ==1:
            return '-1'
        else :
            mycol.insert_one(user_info)
            return '0'

@app.route('/siluan/api/v1.0/upload', methods=['POST'])
def upload():
    information = request.get_json()
    mycol = mydb["collection_1"]
    mycol.insert_one(information)
    return 'ok'

if __name__ == '__main__':
    app.run(debug=True)