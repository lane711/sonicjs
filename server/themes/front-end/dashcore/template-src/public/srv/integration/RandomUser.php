<?php
namespace integration;

use Httpful\Request;

include __DIR__ . '/../components/httpful.phar';

/**
 * This function is the main interface to comunicate with your server.
 * We use randomuser.me to simulate api requests, you should change this endpoint to match your API endpoint
 * https://randomuser.me/documentation#howto
 **/
class RandomUser {
    private $endpoint = 'https://randomuser.me/api/';
    private $userInfoUrl ;

    public $additionalInfoUrl;

    public function __construct() {
        $this->userInfoUrl = "{$this->endpoint}?nat=us,gb,au,es,br,fr&inc=name,location,email,picture";
    }

    public function getSingleUser() {
        $response = \Httpful\Request::get($this->userInfoUrl)
            ->expectsJson()
            ->send();

        return $response->body;
    }

    public function getMultipleUsers($q) {
        $response = Request::get("{$this->userInfoUrl}&results={$q}")
            ->expectsJson()
            ->send();

        return $response->body;
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
