<?php

namespace Tualo\Office\Quill\Middlewares;

use Tualo\Office\Basic\TualoApplication;
use Tualo\Office\Basic\IMiddleware;

class Middleware implements IMiddleware
{
    public static function register()
    {
        TualoApplication::use('quill-js', function () {
            try {

                TualoApplication::javascript('quill', './quill-js/quill.js', [], -5000000);
                TualoApplication::stylesheet('./quill-js/quill.snow.css', 10001);
            } catch (\Exception $e) {
                TualoApplication::set('maintanceMode', 'on');
                TualoApplication::addError($e->getMessage());
            }
        }, -100); // should be one of the last
    }
}
