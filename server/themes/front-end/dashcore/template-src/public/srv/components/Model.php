<?php
namespace components;

class Model {
    var $post = [];
    var $errors = [];

    function __construct($post) {
        $this->post = $this->sanitize($post);
    }

    private function sanitize($values) {
        foreach($values as $i => $value) {
            $values[$i] = filter_var($value, FILTER_SANITIZE_STRING);
        }

        return $values;
    }

    public function __get($name) {
        if (array_key_exists($name, $this->post)) {
            return $this->post[$name];
        }

        return null;
    }

    /**
     * DEFINE RULES FOR YOUR INPUTS
     * Every rule is an array which is composed of two parts:
     *    1. The fields to apply the validation rule
     *    2. The rule to apply and optionally a value for the rule. Every rule is an array as well.
     * For example:
     *    The rule defined as ["email", ["email"]] means, validate the "email" field and apply the "email" rule
     *    The rule defined as ["subject", ["minLength" => 5]] means, validate the "subject" field and apply the "minLength" rule with one parameter with value of 5
     * Every validation rule must be implemented as a function named "validate" + ruleName, the name of the function must be camelCased
     **/
    public function rules () {
        return [];
    }

    // VALIDATION RULES IMPLEMENTED
    function validateRequired($value) {
        return empty($value) ? "Field is required" : "";
    }

    function validateEmail($value) {
        $email = filter_var($value, FILTER_SANITIZE_EMAIL);
        return !filter_var($email, FILTER_VALIDATE_EMAIL) ? "Not a valid email" : "";
    }

    function validateMinLength($value, $length) {
        return (strlen($value) < $length) ? "Minimum length must be of {$length}" : "";
    }

    // Determine if the form is valid
    function isValid() {
        $rules = $this->rules();

        foreach($rules as $k => $item) {
            list($fields, $rules) = $item;
            $fields = explode(",", $fields);

            foreach($fields as $field) {
                foreach($rules as $rule => $value) {
                    if (is_numeric($rule)) {
                        $method = "validate".ucfirst($value);
                        $result = $this->$method($this->$field);
                    } else {
                        $method = "validate".ucfirst($rule);
                        $result = $this->$method($this->$field, $value);
                    }

                    if ($result !== "") {
                        $this->errors[$field] = $result;
                    }
                }
            }
        }

        return count($this->errors) == 0;
    }
}
