<?php
namespace models;

include __DIR__ . '/../components/Model.php';
use components\Model;

class SignupModel extends Model {
    public function rules () {
        return [
            ["username,email,password", ["required"]],
            ["email", ["email"]]
        ];
    }
}
