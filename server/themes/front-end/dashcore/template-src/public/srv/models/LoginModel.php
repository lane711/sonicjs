<?php
namespace models;

include __DIR__ . '/../components/Model.php';
use components\Model;

class LoginModel extends Model {

    public function rules () {
        return [
            ["username,password", ["required"]]
        ];
    }
}
