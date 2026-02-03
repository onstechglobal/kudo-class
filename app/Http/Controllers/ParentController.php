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
    public function store1(Request $request)
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
	
	
	// ParentController.php

	public function store(Request $request){
		$request->validate([
			'first_name' => 'required',
			'email'      => 'required|email|unique:tb_users,email',
			'mobile'     => 'required|digits:10',
			'address_line1' => 'required',
			'city'       => 'required',
		]);

		return DB::transaction(function () use ($request) {
			$username = 'par_' . $request->mobile;
			$password = $this->generatePassword();

			// 1. Create User via Model
			$userId = $this->model->createUser([
				'username' => $username,
				'name'     => $request->first_name . ' ' . $request->last_name,
				'email'    => $request->email,
				'mobile'   => $request->mobile,
				'password' => Hash::make($password),
			]);

			// 2. Create Family via Model
			$familyId = $this->model->createFamily([
				'address_line1' => $request->address_line1,
				'address_line2' => $request->address_line2,
				'city'          => $request->city,
				'state'         => $request->state,
				'pincode'       => $request->pincode,
				'district'       => $request->district,
				'country'       => $request->country ?? 'India',
			]);

			// 3. Create Parent via Model
			$this->model->createParent($request->all(), $userId, $familyId);

			return response()->json([
				'status'   => 201,
				'message'  => 'Parent added successfully',
				'username' => $username,
				'password' => $password
			]);
		});
	}
	
	
	public function searchParents(Request $request) {
		$q = $request->query('q');
		if (!$q) return response()->json([]);

		$parents = $this->model->searchParents($q);
		return response()->json($parents);
	}


    /**
     * Show single parent
     */
	public function show($id){
		$parent = $this->model->getParentById($id);

		if (!$parent) {
			return response()->json(['message' => 'Parent not found'], 404);
		}

		return response()->json(['parent' => $parent]);
	}
	

    /**
     * Update parent
     */
   public function update(Request $request, $id){
		$request->validate([
			'first_name'    => 'required',
			'email'         => 'required|email',
			'mobile'        => 'required|digits:10',
			'address_line1' => 'required',
			'city'          => 'required',
		]);

		return DB::transaction(function () use ($request, $id) {
			$parent = DB::table('tb_parents')->where('parent_id', $id)->first();
			
			if (!$parent) {
				return response()->json(['message' => 'Parent not found'], 404);
			}

			$this->model->updateParentData(
				$id, 
				$request->all(), 
				$parent->user_id, 
				$parent->family_id
			);

			return response()->json([
				'status'  => 200,
				'message' => 'Parent and Family details updated successfully'
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
