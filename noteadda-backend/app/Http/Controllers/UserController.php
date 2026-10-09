<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    function index($name){
        return "My name is ".$name;
    }
}
