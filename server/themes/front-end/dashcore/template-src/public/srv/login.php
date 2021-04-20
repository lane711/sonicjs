<?php
include('./models/LoginModel.php');

use \models\LoginModel;

if ($_SERVER['REQUEST_METHOD'] == 'POST' &&  !empty($_POST['Login'])) {
    $model = new LoginModel($_POST['Login']);

    header('Content-Type: application/json');
    if($model->isValid()) {
        // Do whatever you need to do in order to login your users...

        // Stop the thread for three seconds, just to simulate a process
        sleep(3);

        // Results
        echo json_encode([
            "result" => true,
            "message" => "You've login successfully"
        ]);
    } else {
        echo json_encode([
            "result" => false,
            "message" => "We've found some errors.",
            "errors" => $model->errors
        ]);
    }
}
