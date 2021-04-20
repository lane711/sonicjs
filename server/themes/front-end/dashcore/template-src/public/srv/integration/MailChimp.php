<?php
namespace integration;

include __DIR__ . '/../components/httpful.phar';

class MailChimp {
    private $key;
    private $endpoint = 'https://dc.api.mailchimp.com/3.0';

    public function __construct($key) {
        $this->key = $key;
        list(, $dc) = explode('-', $key);
        $this->endpoint = str_replace('dc', $dc, $this->endpoint);
    }

    public function subscribeToList($listId, $email, $fields = [], $status = "subscribed") {
        //$status = "pending";
        $method = "/lists/{$listId}/members";
        $body = [
            "email_address" => $email,
            "status" => $status
        ];

        if (!empty($fields) && is_array($fields)) {
           $body["merge_fields"] = $fields;
        }

        $response = \Httpful\Request::post($this->endpoint . $method)
        ->sendsJson()
        ->authenticateWith('apikey', $this->key)
        ->body(json_encode($body))
        ->send();

        return $this->processResponse($response);
    }

    private function processResponse($response) {
        $status = $this->getHTTPStatus($response);
        $result = [];

        if ($status >= 200 && $status <= 299) {
            $result["result"] = true;
        } elseif (property_exists($response->body, "title")) {
            $result["error"] = sprintf('%d: %s', $response->body->status, $response->body->title);
            $result["result"] = false;
        } else {
            $result["error"] = "Unknown error.";
            $result["result"] = false;
        }

        return (object)$result;
    }

    private function getHTTPStatus($response) {
        if (property_exists($response, "code")) {
            return $response->code;
        }

        if (property_exists($response, "meta_data")) {
            return $response->meta_data->http_code;
        }

        return 418;
    }
}
