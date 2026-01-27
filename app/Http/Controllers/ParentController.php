<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ParentModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParentController extends Controller
{
    protected ParentModel $model;

    public function __construct()
    {
        $this->model = new ParentModel();
    }

    /**
     * Parent listing (same behavior as Teacher index)
     */
    public function index()
    {
        $parents = $this->model->getAllParents();
        return response()->json($parents);
    }

    /**
     * Store parent + user (same flow as Teacher store)
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required',
            'email'      => 'required|email',
            'mobile'     => 'required|digits:10',
        ]);

        return DB::transaction(function () use ($request) {

            $username = 'par_' . $request->mobile;
            $password = $this->generatePassword();

            // Insert into tb_users (SAME AS TEACHER)
            $userId = DB::table('tb_users')->insertGetId([
                'username'   => $username,
                'name'       => $request->first_name,
                'email'      => $request->email,
                'mobile'     => $request->mobile,
                'password'   => Hash::make($password),
                'role_id'    => 4, // Parent role
                'status'     => 'active',
                'created_at' => now()
            ]);

            // Insert into tb_parents
            $this->model->create($request->all(), $userId);

            return response()->json([
                'status'   => 200,
                'message'  => 'Parent added successfully',
                'username' => $username,
                'password' => $password
            ]);
        });
    }

    /**
     * Show single parent
     */
    public function show($id)
    {
        $parent = DB::table('tb_parents')->where('parent_id', $id)->first();

        if (!$parent) {
            return response()->json(['message' => 'Parent not found'], 404);
        }

        return response()->json(['parent' => $parent]);
    }

    /**
     * Update parent
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'required',
            'email'      => 'required|email',
            'mobile'     => 'required|digits:10',
        ]);

        return DB::transaction(function () use ($request, $id) {

            $parent = DB::table('tb_parents')->where('parent_id', $id)->first();
            if (!$parent) {
                return response()->json(['message' => 'Parent not found'], 404);
            }

            // Update parent table
            DB::table('tb_parents')->where('parent_id', $id)->update([
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'email'             => $request->email,
                'mobile'            => $request->mobile,
                'alternate_mobile'  => $request->alternate_mobile,
                'status'            => $request->status,
                'updated_at'        => now()
            ]);

            // Update user table (SAME AS TEACHER LOGIC)
            DB::table('tb_users')->where('user_id', $parent->user_id)->update([
                'name'   => $request->first_name,
                'email'  => $request->email,
                'mobile' => $request->mobile,
            ]);

            return response()->json([
                'status'  => 200,
                'message' => 'Parent updated successfully'
            ]);
        });
    }

    /**
     * Delete parent + user
     */
    public function destroy($id)
    {
        $parent = DB::table('tb_parents')->where('parent_id', $id)->first();

        if ($parent) {
            DB::table('tb_users')->where('user_id', $parent->user_id)->delete();
            DB::table('tb_parents')->where('parent_id', $id)->delete();
        }

        return response()->json([
            'status'  => 200,
            'message' => 'Parent deleted successfully'
        ]);
    }

    private function generatePassword($length = 10)
    {
        $chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
        return collect(range(1, $length))
            ->map(fn () => $chars[random_int(0, strlen($chars) - 1)])
            ->implode('');
    }
}
