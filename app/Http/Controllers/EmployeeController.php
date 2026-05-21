<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

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
        ]);

        Employee::create($validated);

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil ditambahkan!');
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('Admin/Employee/Edit', [
            'employee' => $employee
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nohp' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'join_date' => 'nullable|date',
        ]);

        $employee->update($validated);

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil diperbarui!');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil dihapus!');
    }
}
