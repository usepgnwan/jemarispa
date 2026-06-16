<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'ilike', "%{$search}%")
                  ->orWhere('title', 'ilike', "%{$search}%")
                  ->orWhere('nohp', 'ilike', "%{$search}%");
        }

        $employees = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Employee/Index', [
            'employees' => $employees,
            'filters' => $request->only('search')
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Employee/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nohp' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'join_date' => 'nullable|date',
            'email' => 'required|email|max:255|unique:users,email',
            'is_active' => 'boolean',
        ]);

        $employee = Employee::create([
            'name' => $validated['name'],
            'nohp' => $validated['nohp'],
            'title' => $validated['title'],
            'join_date' => $validated['join_date'],
        ]);

        \App\Models\User::create([
            'employee_id' => $employee->id,
            'name' => $employee->name,
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'terapis',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil ditambahkan!');
    }

    public function edit(Employee $employee)
    {
        $user = \App\Models\User::where('employee_id', $employee->id)->first();
        $employee->email = $user ? $user->email : '';
        $employee->is_active = $user ? (bool)$user->is_active : true;

        return Inertia::render('Admin/Employee/Edit', [
            'employee' => $employee
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $user = \App\Models\User::where('employee_id', $employee->id)->first();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nohp' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'join_date' => 'nullable|date',
            'email' => ['required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($user ? $user->id : null)],
            'is_active' => 'boolean',
        ]);

        $employee->update([
            'name' => $validated['name'],
            'nohp' => $validated['nohp'],
            'title' => $validated['title'],
            'join_date' => $validated['join_date'],
        ]);

        if ($user) {
            $user->update([
                'name' => $employee->name,
                'email' => $validated['email'],
                'is_active' => $request->boolean('is_active', true),
            ]);
        } else {
            \App\Models\User::create([
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'terapis',
                'is_active' => $request->boolean('is_active', true),
            ]);
        }

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil diperbarui!');
    }

    public function destroy(Employee $employee)
    {
        $user = \App\Models\User::where('employee_id', $employee->id)->first();
        if ($user) {
            $user->delete();
        }
        $employee->delete();
        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil dihapus!');
    }
}
