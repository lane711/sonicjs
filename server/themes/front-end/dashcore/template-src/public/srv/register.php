<?php
include('./integration/MailChimp.php');
include('./models/SubscribeModel.php');

use \integration\MailChimp;
use \models\SubscribeModel;

/**
 * Paste your own values, please remove the squared brackets
 **/
define("LIST_ID", "[Your List Id]");
define("API_KEY", "[Your API Key]");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!empty($_POST['Subscribe'])) {
        $chimp = new MailChimp(API_KEY);
        $model = new SubscribeModel($_POST['Subscribe']);

        if ($model->isValid()) {
            $result = $chimp->subscribeToList(LIST_ID, $model->email);

            if ($result->result) {
                echo json_encode([
                    "result" => true,
                    "message" => "You are now subscribed to our newsletter"
                ]);
            } else {
                echo json_encode([
                    "result" => false,
                    "message" => $result->error,
                    "errors" => [ "email" => $result->error ]
                ]);
            }
        } else {
            echo json_encode([
                "result" => false,
                "message" => "Errors found",
                "errors" => $model->errors
            ]);
        }
    }
}
