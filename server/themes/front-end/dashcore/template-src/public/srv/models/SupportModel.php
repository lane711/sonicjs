<?php
namespace models;

include __DIR__ . '/../components/Model.php';
use components\Model;

class SupportModel extends Model {

    public function rules () {
        return [
            ["fullName,email,message", ["required"]],
            ["email", ["email"]],
            ["message,fullName", ["minLength" => 10]]
        ];
    }
}
