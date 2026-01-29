// Function to handle search
const searchCustomers = () => {
    const input = document.getElementById("searchInput");
    const searchValue = input.value;
    
    // Use backend endpoint with SQL Injection vulnerability
    $.ajax({
        url: '/customers/json',
        method: 'GET',
        data: { name: searchValue },
        success: (response) => {
            // Update table with search results
            const tbody = document.querySelector('.table tbody');
            if (tbody) {
                tbody.innerHTML = '';
                if (response.customers && response.customers.length > 0) {
                    response.customers.forEach(customer => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${customer.name}</td>
                            <td>${customer.city}</td>
                            <td>${customer.age}</td>
                            <td>
                                <a href="#" class="btn btn-warning btn-sm" onclick="editCustomer(${customer.id})">Edit</a>
                                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        },
        error: (error) => {
            console.log('Search error:', error);
            // Show error if SQL injection attempt fails
            if (error.responseJSON && error.responseJSON.details) {
                alert('Search error: ' + error.responseJSON.details);
            }
        }
    });
};

// Event listener for search input
document.getElementById("searchInput").addEventListener("input", searchCustomers);

$(document).ready(() => {
    $('#addCustomerForm').submit(event => {
        event.preventDefault();  // Prevent the default form submission

        // Get form data
        const name = $('#name').val();
        const city = $('#city').val(); 
        const age = $('#age').val(); 

        // Send an AJAX request to create a new customer
        $.ajax({
            url: '/customers/create',
            method: 'POST',
            data: {
                name: name,
                city: city, 
                age: age 
            },
            success: () => {
                console.log('Customer added successfully!');
                alert('Customer added successfully!');

                // Close the modal
                $('#addCustomerModal').modal('hide');

                // Reload the page to show the updated Customer list
                location.reload();
            },
            error: error => {
                console.log('Error:', error);
                // Display an error notification
                alert('Error adding customer: ' + error.responseJSON.error);
            }
        });
    });
});


// Function to handle edit customer
const editCustomer = customerId => {
    console.log('Edit button clicked for customer ID:', customerId);

    // Fetch the existing customer data for the given customerId via an AJAX request
    $.ajax({
        url: `/customers/${customerId}/edit-data`,
        method: 'GET',
        success: response => {
            console.log('Success:', response);

            if (response.success) {
                const customerData = response.customer;

                // Pre-fill the modal form fields with the existing customer data
                $('#edit_name').val(customerData.name);
                $('#edit_city').val(customerData.city);
                $('#edit_age').val(customerData.age);

                // Store the customerId in a data attribute of the save button
                $('#saveEditCustomerButton').attr('data-customer-id', customerId);

                // Show the modal for editing
                $('#editCustomerModal').modal('show');
            } else {
                console.log('Error:', response.error);
                alert('Error fetching customer data: ' + response.error);
            }
        },
        error: (xhr, textStatus, errorThrown) => {
            console.log('Error:', errorThrown);
            alert('Error fetching customer data: ' + errorThrown);
        }
    });
};


// Function to handle delete customer
const deleteCustomer = (customerId) => {
    $.ajax({
        url: `/customers/${customerId}/delete`,
        method: 'POST',
        success: () => {
            console.log('Customer deleted successfully!');
            alert('Customer deleted successfully!');
            location.reload();
        },
        error: (error) => {
            console.log('Error:', error);
            alert('Error deleting customer: ' + error.responseJSON.error);
        }
    });
};


// Event listener for the edit form submission
$(document).ready(() => {
    $('#saveEditCustomerButton').click((event) => {
        const customerId = $(event.target).attr('data-customer-id');

        // Get form data
        const name = $('#edit_name').val();
        const city = $('#edit_city').val();
        const age = $('#edit_age').val();

        // Send an AJAX request to update the customer data
        $.ajax({
            url: `/customers/${customerId}/edit`,
            method: 'POST',
            data: {
                name: name,
                city: city,
                age: age
            },
            success: () => {
                console.log('Customer updated successfully!');
                alert('Customer updated successfully!');
                $('#editCustomerModal').modal('hide');
                location.reload();
            },
            error: (xhr, textStatus, errorThrown) => {
                console.log('Error:', errorThrown);
                alert('Error updating customer: ' + errorThrown);
            }
        });
    });
});

