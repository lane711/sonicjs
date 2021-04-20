<?php
namespace models;

include __DIR__ . '/../components/Model.php';
use components\Model;

class ContactModel extends Model {

    public function rules () {
        return [
            ["email,subject,message", ["required"]],
            ["email", ["email"]]
        ];
    }
}
