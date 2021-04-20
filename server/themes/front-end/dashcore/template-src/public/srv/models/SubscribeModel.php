<?php
namespace models;

include __DIR__ . '/../components/Model.php';
use components\Model;

class SubscribeModel extends Model {
    public function rules () {
        return [
            ["email", ["required"]],
            ["email", ["email"]]
        ];
    }
}
