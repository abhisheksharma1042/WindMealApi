/*======================================================================
      Author: Abhishek Sharma
      FileName: style.css
      Class: CSC 337
      Description: Describes all iterraction with front-end and makes calls to API
====================================================================== */

async function tooglePasswordVisibility() {
  var x = document.getElementById('register-psw-inp');
  if (x.type === 'password') {
    x.type = 'text';
  } else {
    x.type = 'password';
  }
}

var loggedInUser;
var token;
// ------------- AUTHENTICATION ROUTES-------------//

async function forgotPassword() {
  let msg = { email: $('#reset-password-email').val() };
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/forgotpassword',
    method: 'POST',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (res, status, xhr) {
      alert(res.info);
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function currentUser() {
  $.ajax({
    url: 'https://windmeal.live/api/v1/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    complete: function (result) {
      if (result.responseJSON.success) {
        //
        sessionStorage.setItem('user-role', result.responseJSON.data.user.role);
        sessionStorage.setItem('user-name', result.responseJSON.data.user.name);
        sessionStorage.setItem(
          'user-email',
          result.responseJSON.data.user.email
        );
        sessionStorage.setItem(
          'farm',
          JSON.stringify(result.responseJSON.data.farm)
        );
        sessionStorage.setItem(
          'reviews',
          JSON.stringify(result.responseJSON.data.reviews)
        );
      } else {
        alert(result.responseJSON.error);
        farmsView();
      }
    },
  });
}

async function login() {
  let msg = {
    email: $('#login-email-inp').val(),
    password: $('#login-password-inp').val(),
  };
  //
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/login',
    method: 'POST',
    data: JSON.stringify(msg),
    success: function (res, status, xhr) {
      sessionStorage.setItem('token', res.token);
      //
      //   alert(res.getAllResponseHeaders());
      alert('User Logged In');
      farmsView();
      currentUser();
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
      loginView();
    },
  });
}

async function logout() {
  $.ajax({
    url: 'https://windmeal.live/api/v1/auth/logout',
    method: 'GET',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (result) {
      if (result.success) {
        sessionStorage.clear();
        alert('User Logged Out');
        homeView();
      } else {
        alert(result.error);
      }
    },
  });
}

async function register() {
  let role = $("input[name='role']:checked").val();
  let msg = {
    email: $('#register-email').val(),
    name: $('#register-name').val(),
    password: $('#register-psw-inp').val(),
    role: role,
  };

  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/register',
    method: 'POST',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (res, status, xhr) {
      sessionStorage.setItem('token', res.token);
      //
      //   alert(res.getAllResponseHeaders());
      alert('User Registered and Logged In');
      currentUser();
      farmsView();
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
      registerView();
    },
  });
}

async function resetPassword() {
  let msg = { password: $('#new-password-input').val() };
  token = sessionStorage.getItem('reset-token');
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/resetpassword/' + token,
    method: 'PUT',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (res, status, xhr) {
      if (res.success) {
        alert('Password updated, Login again');
        logout();
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function getResetToken(url) {
  $.ajax({
    url: url,
    method: 'get',
    success: function (result) {
      if (result.success) {
        sessionStorage.setItem('reset-token', result.resetToken);
        alert(result.resetToken);
        updatePasswordView('reset');
      }
    },
    error: function (error) {
      alert(error.responseJSON.error);
    },
  });
}

function updateUserDetails() {
  let msg = {
    email: $('#manage-account-email-input').val(),
    name: $('#manage-account-name-input').val(),
  };
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/updatedetails',
    method: 'PUT',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (res, status, xhr) {
      if (res.success) {
        alert('User details updated');
        currentUser();
      }
    },
    error: function (error) {
      alert(error.responseJSON.error);
    },
  });
}

async function updatePassword() {
  let msg = {};
  msg.currentPassword = $('#current-password-input').val();
  msg.newPassword = $('#new-password-input').val();
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/auth/updatepassword/',
    method: 'PUT',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (res, status, xhr) {
      if (res.success) {
        alert('Password updated, Login again');
        logout();
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

// ------------- FARM ROUTES -------------//
async function createFarm() {
  let meat;
  if ($('#add-farm-meat').is(':checked')) {
    meat = 'true';
  } else {
    meat = 'false';
  }
  let msg = {
    email: $('.add-farm-email').val(),
    name: $('.add-farm-name').val(),
    delivery: $('#add-farm-delivery').is(':checked'),
    pickup: $('#add-farm-pickup').is(':checked'),
    meat: meat,
    storage: $('#add-farm-storage').is(':checked'),
    description: $('.add-farm-description').val(),
    website: $('.add-farm-website').val(),
    phone: $('.add-farm-phone').val(),
    address: $('.add-farm-address').val(),
  };

  //   return;
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms',
    contentType: 'application/json; charset=utf-8',
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: JSON.stringify(msg),
    success: function (res, status, xhr) {
      if (res.success) {
        alert('Farm Added');
        currentUser();
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function deleteFarm() {
  currentUser();
  let id = JSON.parse(sessionStorage.getItem('farm'))[0].id;
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    complete: function (result) {
      if (result.responseJSON.success) {
        alert('Farm Deleted');
        currentUser();
      } else {
        alert(result.responseJSON.error);
      }
    },
  });
}

async function findFarm(zipcode, miles) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/radius/' + zipcode + '/' + miles,
    method: 'GET',
    success: function (result) {
      if (result.success) {
        sessionStorage.setItem('count', result.count);
        setupPagination(result.pagination);

        displayFarms(result.data);
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function getAllFarms(filter) {
  let url;
  if (filter) {
    url = 'https://windmeal.live/api/v1/farms?limit=4' + filter;
  } else {
    url = 'https://windmeal.live/api/v1/farms?limit=4';
  }
  $.ajax({
    url: url,
    method: 'GET',
    success: function (result) {
      if (result.success) {
        sessionStorage.setItem('count', result.count);
        setupPagination(result.pagination);
        displayFarms(result.data);
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function getSingleFarm(id) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id,
    method: 'GET',
    complete: function (result) {
      if (result.responseJSON.success) {
        updateFarmView(result.responseJSON.data);
      } else {
        alert(result.responseJSON.error);
      }
    },
  });
}

async function updateFarm() {
  let msg = {};
  let meat;
  if ($('#add-farm-meat').is(':checked')) {
    meat = 'true';
  } else {
    meat = 'false';
  }
  msg.delivery = $('#add-farm-delivery').is(':checked');
  msg.pickup = $('#add-farm-pickup').is(':checked');
  msg.meat = meat;
  msg.storage = $('#add-farm-storage').is(':checked');
  if ($('.add-farm-email').val()) {
    msg.email = $('.add-farm-email').val();
  }
  if ($('.add-farm-name').val()) {
    msg.name = $('.add-farm-name').val();
  }
  if ($('.add-farm-description').val()) {
    msg.description = $('.add-farm-description').val();
  }
  if ($('.add-farm-website').val()) {
    msg.website = $('.add-farm-website').val();
  }
  if ($('.add-farm-phone').val()) {
    msg.phone = $('.add-farm-phone').val();
  }
  if ($('.add-farm-address').val()) {
    msg.address = $('.add-farm-address').val();
  }

  currentUser();
  let id = JSON.parse(sessionStorage.getItem('farm'))[0].id;
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/farms/' + id,
    method: 'PUT',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: JSON.stringify(msg),
    success: function (res, status, xhr) {
      if (res.success) {
        alert('Farm Updated');
        currentUser();
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function getFarmPublishers() {
  currentUser();
  let id = loggedInUser.farm._id;
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id + '/publishers',
    method: 'GET',
    success: function (result) {
      if (result.success) {
        alert('User Added');
      } else {
        alert(result.error);
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function addPhotoToFarm(file) {
  let id = JSON.parse(sessionStorage.getItem('farm'))[0].id;
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id + '/photo',
    method: 'PUT',
    contentType:
      'multipart/form-data;boundary=----WebKitFormBoundaryuTWE5QPFKyFM3VoD',
    data: file,
    processData: false,
    cache: false,
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (result) {
      if (result.success) {
        alert('Photo uploaded');
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

// ------------- PRODUCT ROUTES-------------//

async function addPhotoToProduct() {
  let id = 'Get Product ID';
  let msg = { file: 'file' };
  $.ajax({
    contentType: 'multipart/form-data; charset=utf-8',
    url: 'https://windmeal.live/api/v1/products/' + id + '/photo',
    method: 'PUT',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: msg,
    success: function (result) {
      if (result.success) {
        alert('User Added');
      } else {
        alert(result.error);
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function createProduct() {
  let msg = {
    title: $('#add-product-title').val(),
    description: $('#add-product-description').val(),
    price: $('#add-product-price').val(),
    quantity: $('.add-product-quantity').val(),
  };
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/products',
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: JSON.stringify(msg),
    success: function (result) {
      if (result.success) {
        alert('User Added');
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function deleteProduct(id) {
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/products/' + id,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    success: function (result) {
      if (result.success) {
        alert('Product Deleted!');
      }
    },
    error: function (error) {
      alert(error.responseJSON.error);
    },
  });
}

async function getAllProducts() {
  $.ajax({
    url: 'https://windmeal.live/api/v1/products',
    method: 'GET',
    success: function (result) {
      if (result.success) {
        alert('User Added');
      } else {
        alert(result.error);
      }
    },
  });
}

async function getProductsOfFarm(id, context) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id + '/products',
    method: 'GET',
    success: function (result) {
      if (result.success) {
        if (context === 'manage') {
          updateManageProductsView(result.data);
        } else if (context === 'view') {
          displayProducts(result.data);
        }
      }
    },
  });
}

async function getSingleProduct(id, context) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/products/' + id,
    method: 'GET',
    success: function (result) {
      if (result.success) {
        updateAddProductView(result.data, context);
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

async function updateProduct(id) {
  let msg = {};

  if ($('#add-product-title').val()) {
    msg.title = $('#add-product-title').val();
  }
  if ($('#add-product-quantity').val()) {
    msg.quantity = $('#add-product-quantity').val();
  }
  if ($('#add-product-price').val()) {
    msg.price = $('#add-product-price').val();
  }
  if ($('#add-product-expiry').val()) {
    msg.sellBy = $('#add-product-expiry').val();
  }
  if ($('#add-product-description').val()) {
    msg.description = $('#add-product-description').val();
  }

  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/products/' + id,
    method: 'PUT',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: JSON.stringify(msg),
    success: function (result) {
      if (result.success) {
        alert('Product updated');
      }
    },
    error: function (error) {
      //
      alert(error.responseJSON.error);
    },
  });
}

// ------------- REVIEW ROUTES-------------//

async function addReview(id) {
  let msg = {
    title: $('#write-review-title').val(),
    text: $('#write-review-text').val(),
    rating: $('#write-review-rating').val(),
  };
  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/farms/' + id + '/reviews',
    method: 'POST',
    data: JSON.stringify(msg),
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    complete: function (event) {
      //
      if (event.responseJSON.success) {
        alert('Review Added');
        currentUser();
      } else {
        if (event.responseJSON.error === 'Duplicate field value entered') {
          alert('You have already reviewed this farm!');
        } else {
          alert(event.responseJSON.error);
        }
      }
    },
  });
}

async function updateReview(id) {
  let msg = {};
  if ($('#write-review-title').val()) {
    msg.title = $('#write-review-title').val();
  }
  if ($('#write-review-text').val()) {
    msg.text = $('#write-review-text').val();
  }
  if ($('#write-review-rating').val()) {
    msg.rating = $('#write-review-rating').val();
  }

  $.ajax({
    contentType: 'application/json; charset=utf-8',
    url: 'https://windmeal.live/api/v1/reviews/' + id,
    method: 'PUT',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    data: JSON.stringify(msg),
    success: function (result) {
      if (result.success) {
        alert('Review updated!');
        currentUser();
      } else {
        alert(result.error);
      }
    },
  });
}

async function getSingleReview(id, context) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/reviews/' + id,
    method: 'GET',
    success: function (result) {
      if (result.success) {
        updateReviewEdit(result.data, context);
      } else {
        alert(result.error);
      }
    },
  });
}

async function deleteReview(id) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/reviews/' + id,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    complete: function (result) {
      if (result.responseJSON.success) {
        alert('Review Deleted');
        currentUser();
        reviewManage();
      } else {
        alert(result.responseJSON.error);
      }
    },
  });
}

async function getAllReviews() {
  $.ajax({
    url: 'https://windmeal.live/api/v1/reviews',
    method: 'GET',
    success: function (result) {
      if (result.success) {
        alert('User Added');
      } else {
        alert(result.error);
      }
    },
  });
}

async function getReviewsOfFarm(id) {
  $.ajax({
    url: 'https://windmeal.live/api/v1/farms/' + id + '/reviews',
    method: 'GET',
    complete: function (result) {
      if (result.responseJSON.success) {
        updateReadReviewView(result.responseJSON.data);
      } else {
        alert(result.responseJSON.error);
      }
    },
  });
}

// ------------- USER ROUTES-------------//
// All user crud functinality only available admin only.
// Farmers can also create 'farm-publisher' role accounts
async function createUser() {
  let url = 'https://windmeal.live/api/v1/auth/forgotpassword';
}

async function deleteUser() {
  let url = 'https://windmeal.live/api/v1/auth/forgotpassword';
}

async function getAllUsers() {
  let url = 'https://windmeal.live/api/v1/auth/forgotpassword';
}

async function getSinngleUser() {
  let url = 'https://windmeal.live/api/v1/auth/forgotpassword';
}

async function updateUser() {
  let url = 'https://windmeal.live/api/v1/auth/forgotpassword';
}

//---------DISPLAY FARMS-----------//
/*
 *Description: Helper function to display products.
 */
async function displayFarms(listings) {
  $('.farm-card').remove();
  if (listings.length > 0) {
    $.each(listings, function (index, item) {
      //
      $newfarm = $('.base-farm').clone(true).toggleClass('farm-card');
      $newfarm.removeClass('base-farm');
      $newfarm
        .find('.farm-title')
        .prop('id', item._id + 'Title')
        .html(item.name);
      $newfarm
        .find('.farm-rating')
        .prop('id', item._id + 'Rating')
        .html(item.averageRating);
      $newfarm
        .find('.badge-dark')
        .prop('id', item._id + 'address')
        .html(item.location.city + ', ' + item.location.state);
      $newfarm
        .find('img')
        .prop('id', item._id + 'Img')
        .attr('src', 'img/' + item.photo);
      $newfarm
        .find('.farm-description')
        .prop('id', item._id + 'Dscrp')
        .html(item.description);
      $('.farms-magic').prepend($newfarm);
      $('.farm-card').show();
    });
  }
}

/*
 *Description: Helper function to display products.
 */
async function displayProducts(listings) {
  $('.product').remove();
  if (listings.length > 0) {
    $.each(listings, function (index, item) {
      //
      $newproduct = $('.base-product').clone(true).toggleClass('product');
      $newproduct.removeClass('base-product');
      $newproduct
        .find('h4')
        .prop('id', item._id + 'Title')
        .html(item.title);
      $newproduct
        .find('h6')
        .prop('id', item._id + 'Status')
        .html(item.status);
      $newproduct
        .find('img')
        .prop('id', item._id + 'Img')
        .attr('src', 'img/' + item.photo);
      $newproduct.find('input').prop('id', item._id + 'Qty');
      $newproduct.find('input').prop('disabled', true);
      $newproduct
        .find('.product-dscrp')
        .prop('id', item._id + 'Dscrp')
        .html('Description: ' + item.description);
      $newproduct
        .find('.product-price')
        .prop('id', item._id + 'Price')
        .html('Price: $' + item.price);
      $newproduct.find('.buy-now').prop('id', item._id + 'Buy');
      if (item.status == 'Sold out') {
        $newproduct.find('button').prop('disabled', true);
      } else {
        $newproduct.find('button').prop('disabled', false);
      }
      $('.magic').append($newproduct);
      $('.product').show();
    });
  }
}

/*
 *Description: Helper function to display products.
 */
async function updateFarmView(farm) {
  $('#farm-view-title').html(farm.name);
  $('#farm-view-description').html(farm.description);
  $('#farm-view-rating').html(farm.averageRating);
  $('#farm-view-photo').attr('src', 'img/' + farm.photo);
  $('#farm-view-website').attr('href', farm.website);
  $('.farm-view-read').prop('id', farm._id + 'Read');
  $('.farm-view-write').prop('id', farm._id + 'Write');
  $('.farm-view-write').prop('name', farm.name + 'Write');
  let q =
    farm.location.street + ',' + farm.location.city + ',' + farm.location.state;
  q = q.split(' ').join('+').split(',').join('%2C');

  $('#farm-view-map').attr(
    'src',
    `https://www.google.com/maps/embed/v1/place?key=AIzaSyAGiEYZ3yMYMvdz5yPdg38CuF49zt5Xpn8&q=${q}&zoom=15`
  );
  if (farm.meat) {
    $('#farm-view-meat').html('<i class="fas fa-check text-success"></i> Meat');
  } else {
    $('#farm-view-meat').html('<i class="fas fa-times text-danger"></i> Meat');
  }

  if (farm.pickup) {
    $('#farm-view-pickup').html(
      '<i class="fas fa-check text-success"></i> Pickup'
    );
  } else {
    $('#farm-view-pickup').html(
      '<i class="fas fa-times text-danger"></i> Pickup'
    );
  }

  if (farm.delivery) {
    $('#farm-view-delivery').html(
      '<i class="fas fa-check text-success"></i> Delivery'
    );
  } else {
    $('#farm-view-delivery').html(
      '<i class="fas fa-times text-danger"></i> Delivery'
    );
  }

  if (farm.storage) {
    $('#farm-view-storage').html(
      '<i class="fas fa-check text-success"></i> Storage'
    );
  } else {
    $('#farm-view-storage').html(
      '<i class="fas fa-times text-danger"></i> Storage'
    );
  }
}

/*
 *Description: Helper function to display products.
 */
async function updateReadReviewView(reviews) {
  $('.readReview-farmView').prop('id', reviews[0].farm._id + 'SwitchView');
  $('.readReview-writeReview').prop('id', reviews[0].farm._id + 'SwitchView');
  $('.readReview-writeReview').prop(
    'name',
    reviews[0].farm.name + 'SwitchView'
  );
  $('.review-farm-name').html(reviews[0].farm.name + ' Reviews');
  $('.review').remove();
  if (reviews.length > 0) {
    $.each(reviews, function (index, review) {
      //
      $newreview = $('.base-review').clone(true).toggleClass('review');
      $newreview.removeClass('base-review');
      $newreview
        .find('.review-title')
        .prop('id', review._id + 'Title')
        .html(review.title);
      $newreview
        .find('.review-text')
        .prop('id', review._id + 'Text')
        .html(review.text);
      $newreview
        .find('.review-rating')
        .prop('id', review._id + 'Rating')
        .html(review.rating);
      $newreview
        .find('.review-user')
        .prop('id', review._id + 'User')
        .html('Writtern By ' + review.user.name);
      $('.review-magic').append($newreview);
      $('.review').show();
    });
  }
}
/*
 *Description: Helper function to display products.
 */
async function updateManageReviewsView(reviews) {
  //   if (!reviews) {
  //     alert('No reviews');
  //     return;
  //   }
  $('.manage-review-card').remove();
  if (reviews.length > 0) {
    $.each(reviews, function (index, review) {
      //
      $newreview = $('.base-manage-review-card')
        .clone(true)
        .toggleClass('manage-review-card');
      $newreview.removeClass('base-manage-review-card');
      $newreview
        .find('.manage-review-card-name')
        .prop('id', review.farm._id + 'Title')
        .html(review.farm.name);
      $newreview
        .find('.manage-review-card-delete')
        .prop('id', review._id + 'Delete');
      $newreview
        .find('.manage-review-card-rating')
        .prop('id', review._id + 'Rating')
        .html(review.rating);
      $newreview
        .find('.manage-review-card-edit')
        .prop('id', review._id + 'Edit');
      $('.manage-review-table').append($newreview);
      $('.manage-review-card').show();
    });
  }
}

/*
 *Description: Helper function to display products.
 */
async function updateManageProductsView(products) {
  if (!products) {
    alert('No products');
    return;
  }
  $('.manage-product-card').remove();
  if (products.length > 0) {
    $.each(products, function (index, product) {
      //
      $newproduct = $('.base-manage-product-card')
        .clone(true)
        .toggleClass('manage-product-card');
      $newproduct.removeClass('base-manage-product-card');
      $newproduct
        .find('.manage-product-card-name')
        .prop('id', product.farm._id + 'Title')
        .html(product.farm.name);
      $newproduct
        .find('.manage-product-card-delete')
        .prop('id', product._id + 'Delete');
      $newproduct
        .find('.manage-product-card-rating')
        .prop('id', product._id + 'Rating')
        .html(product.rating);
      $newproduct
        .find('.manage-product-card-price')
        .prop('id', product._id + 'Price')
        .html(product.price);
      $newproduct
        .find('.manage-product-card-quantity')
        .prop('id', product._id + 'Quantity')
        .html(product.quantity);
      $newproduct
        .find('.manage-product-card-edit')
        .prop('id', product._id + 'Edit');
      $('.manage-product-table').append($newproduct);
      $('.manage-product-card').show();
    });
  }
}

async function updateManageFarmView(farm) {
  if (!farm) {
    $('#manage-farm-name').html(
      'Farm Name<span class="float-right badge badge-success" id="manage-farm-rating">rating</span>'
    );
    return;
  }
  $('#manage-farm-name').html(
    farm.name +
      '<span class="float-right badge badge-success" id="manage-farm-rating">rating</span>'
  );
  //
  if (farm.averageRating === undefined) {
    $('#manage-farm-rating').html('rating');
  } else {
    $('#manage-farm-rating').html(farm.averageRating);
  }

  $('.manage-farm-address').html(
    farm.location.city + ', ' + farm.location.state
  );
  $('.manage-farm-description').html(farm.description);
  $('#manage-farm-photo').attr('src', './img/' + farm.photo);
}

async function farmsView(filter) {
  $('.farm').hide();
  $('.add-farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.add-product').hide();
  $('.browse').show();
  $('.manage-products').hide();
  $('.homepageNav').hide();
  $('.register').hide();
  $('.manage-account').hide();
  $('.showcase').hide();
  $('.userNav').show();
  $('.manage-reviews').hide();
  $('.login').hide();
  if (filter) {
    getAllFarms(filter);
  } else {
    getAllFarms(null);
  }
}

async function farmView(farmID) {
  $('.farm').show();
  $('.read-review').hide();
  $('.add-farm').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.homepageNav').hide();
  $('.add-product').hide();
  $('.showcase').hide();
  $('.manage-products').hide();
  $('.manage-account').hide();
  $('.userNav').show();
  $('.manage-reviews').hide();
  $('.register').hide();
  $('.login').hide();
  getProductsOfFarm(farmID, 'view');
  getSingleFarm(farmID);
}

async function registerView() {
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.add-farm').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.manage-account').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.add-product').hide();
  $('.homepageNav').show();
  $('.manage-products').hide();
  $('.showcase').hide();
  $('.userNav').hide();
  $('.manage-reviews').hide();
  $('.login').hide();
  $('.register').show();
}

async function manageFarmView() {
  currentUser();
  let farm = JSON.parse(sessionStorage.getItem('farm'))[0];
  if (!farm) {
    alert('No Farm Added');
    $('#manage-farm-name').html(
      'Farm Name<span class="float-right badge badge-success" id="manage-farm-rating">rating</span>'
    );
    $('.manage-farm-address').html('city, state');
    $('.manage-farm-description').html('Farm Description');
  } else {
    $('#manage-farm-name').html(
      farm.name +
        '<span class="float-right badge badge-success" id="manage-farm-rating">rating</span>'
    );
    if (farm.averageRating === undefined) {
    } else {
      $('#manage-farm-rating').html(farm.averageRating);
    }
    $('.manage-farm-address').html(
      farm.location.city + ', ' + farm.location.state
    );
    $('.manage-farm-description').html(farm.description);
    $('#manage-farm-photo-inp').data('farmID', farm.id);
    $('#farm-photo-form').data(
      'token',
      `Bearer ${sessionStorage.getItem('token')}`
    );
  }
  if (sessionStorage.getItem('user-role')) {
    if (sessionStorage.getItem('user-role') !== 'farmer') {
      alert('Not authorized to access route');
      return;
    }
  }

  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').show();
  $('.add-farm').hide();
  $('.browse').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.manage-account').hide();
  $('.add-product').hide();
  $('.homepageNav').hide();
  $('.showcase').hide();
  $('.manage-products').hide();
  $('.userNav').show();
  $('.login').hide();
  $('.manage-reviews').hide();
  $('.register').hide();
  updateManageFarmView(farm);
}

async function updateReviewEdit(review, context) {
  if (context === 'edit') {
    $('#write-review-text').prop('placeholder', review.text);
    $('#write-review-rating-text').html(review.rating);
    $('#write-review-title').prop('placeholder', review.title);
    $('#write-review-form')[0].reset();
    $('#write-review-rating').prop('value', '' + review.rating);
    $('#write-review-form').find('input').prop('required', false);
    $('#write-review-form').find('textarea').prop('required', false);
  } else {
    $('#write-review-text').prop('placeholder', 'Your Review');
    $('#write-review-rating').prop('value', '8');
    $('#write-review-rating-text').html('8');
    $('#write-review-title').prop('placeholder', 'Review Title');
    $('#write-review-form').find('input').prop('required', true);
    $('#write-review-form').find('textarea').prop('required', true);
  }
}

async function homeView() {
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').show();
  $('.showcase').show();
  $('.add-farm').hide();
  $('.manage-account').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.add-product').hide();
  $('.userNav').hide();
  $('.manage-products').hide();
  $('.login').hide();
  $('.manage-reviews').hide();
  $('.register').hide();
}

async function loginView() {
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').show();
  $('.showcase').hide();
  $('.add-farm').hide();
  $('.update-password').hide();
  $('.manage-account').hide();
  $('.reset-password').hide();
  $('.add-product').hide();
  $('.userNav').hide();
  $('.manage-products').hide();
  $('.login').show();
  $('.manage-reviews').hide();
  $('.register').hide();
}

async function reviewRead(farmID) {
  $('.farm').hide();
  $('.read-review').show();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').hide();
  $('.showcase').hide();
  $('.reset-password').hide();
  $('.userNav').show();
  $('.add-farm').hide();
  $('.manage-account').hide();
  $('.update-password').hide();
  $('.add-product').hide();
  $('.login').hide();
  $('.manage-products').hide();
  $('.manage-reviews').hide();
  $('.register').hide();
  getReviewsOfFarm(farmID);
}

async function reviewWrite(context, farmId, farmName) {
  //
  if (context === 'edit') {
    $('#update-review-write-1234567').hide();
    $('#update-review-edit-7654321').show();
  } else {
    $('#update-review-write-1234567').show();
    $('#update-review-edit-7654321').hide();
    $('.write-review-submit').prop('id', farmId + 'Submit');
    updateReviewEdit(null, 'add');
  }
  currentUser();

  if (sessionStorage.getItem('user-role')) {
    if (sessionStorage.getItem('user-role') !== 'client') {
      alert('Not authorized to access route');
      return;
    }
  }
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').show().data('context', context);
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').hide();
  $('.showcase').hide();
  $('.reset-password').hide();
  $('.userNav').show();
  $('.add-farm').hide();
  $('.update-password').hide();
  $('.manage-account').hide();
  $('.login').hide();
  $('.manage-products').hide();
  $('.add-product').hide();
  $('.manage-reviews').hide();
  $('.register').hide();

  $('.writeReview-farmView').prop('id', farmId + 'SwitchView');

  $('#write-review-farm-name').html(farmName);
}

async function reviewManage() {
  currentUser();

  if (sessionStorage.getItem('user-role')) {
    if (sessionStorage.getItem('user-role') !== 'client') {
      alert('Not authorized to access route');
      return;
    }
  }
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').hide();
  $('.showcase').hide();
  $('.userNav').show();
  $('.add-farm').hide();
  $('.update-password').hide();
  $('.reset-password').hide();
  $('.manage-account').hide();
  $('.add-product').hide();
  $('.login').hide();
  $('.register').hide();
  $('.manage-products').hide();
  $('.manage-reviews').show();
  let reviews = sessionStorage.getItem('reviews');
  updateManageReviewsView(JSON.parse(reviews));
}

async function addFarmView(context) {
  currentUser();
  let farm = JSON.parse(sessionStorage.getItem('farm'))[0];
  if (context === 'add') {
    if (farm) {
      alert('Only one Farm per account. First delete existing Farm');
      return;
    }
  }

  if (context === 'add') {
    $('.add-farm-context').html('Add Farm');
    $('.add-farm-name').prop('placeholder', 'Farm Name');
    $('.add-farm-address').prop('placeholder', 'Full Address');
    $('.add-farm-phone').prop('placeholder', 'Phone');
    $('.add-farm-email').prop('placeholder', 'Contact Email');
    $('.add-farm-website').prop('placeholder', 'Website URL');
    $('.add-farm-description').prop(
      'placeholder',
      'Description (What you offer, etc)'
    );
    $('#add-farm-form').find('input').prop('required', true);
    $('#add-farm-form').find('textarea').prop('required', true);
  } else {
    if (!farm) {
      alert('Please Add Farm');
      return;
    }
    $('.add-farm-context').html('Edit Farm');
    $('.add-farm-name').prop('placeholder', farm.name);
    $('.add-farm-address').prop(
      'placeholder',
      farm.location.street +
        ', ' +
        farm.location.city +
        ', ' +
        farm.location.state
    );
    $('.add-farm-phone').prop('placeholder', 'Phone');
    $('.add-farm-email').prop('placeholder', farm.email);
    $('.add-farm-website').prop('placeholder', farm.website);
    $('.add-farm-description').prop('placeholder', farm.description);
    if (farm.delivery) {
      $('#add-farm-delivery').prop('checked', true);
    }
    if (farm.meat) {
      $('#add-farm-meat').prop('checked', true);
    }
    if (farm.pickup) {
      $('#add-farm-pickup').prop('checked', true);
    }
    if (farm.storage) {
      $('#add-farm-storage').prop('checked', true);
    }
    if (farm.meat) {
      $('#add-farm-meat').prop('checked', true);
    } else {
      $('#no').prop('checked', true);
    }
    $('#add-farm-form').find('input').prop('required', false);
    $('#add-farm-form').find('textarea').prop('required', false);
  }

  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').hide();
  $('.showcase').hide();
  $('.userNav').show();
  $('.add-farm').show().data('context', context);
  $('.login').hide();
  $('.manage-reviews').hide();
  $('.update-password').hide();
  $('.manage-account').hide();
  $('.add-product').hide();
  $('.manage-products').hide();
  $('.reset-password').hide();
  $('.register').hide();
}

async function passwordResetView() {
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.homepageNav').show();
  $('.showcase').hide();
  $('.userNav').hide();
  $('.add-farm').hide();
  $('.login').hide();
  $('.update-password').hide();
  $('.manage-reviews').hide();
  $('.manage-account').hide();
  $('.add-product').hide();
  $('.reset-password').show();
  $('.manage-products').hide();
  $('.register').hide();
}

async function updatePasswordView(context) {
  if (context === 'reset') {
    $('.homepageNav').show();
    $('.userNav').hide();
    //Set required
    $('#add-farm-form').find('#new-password-input').prop('required', true);
    $('#add-farm-form')
      .find('#new-password-confirm-input')
      .prop('required', true);
    $('#add-farm-form').find('#current-password-input').prop('required', false);
    $('.current-password-update-form').hide();
  } else if (context === 'update') {
    $('.homepageNav').hide();
    $('.userNav').show();
    //Set required
    $('#add-farm-form').find('input').prop('required', true);
    $('.current-password-update-form').show();
  }
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.showcase').hide();
  $('.add-farm').hide();
  $('.login').hide();
  $('.update-password').show().data('context', context);
  $('.manage-reviews').hide();
  $('.reset-password').hide();
  $('.manage-account').hide();
  $('.add-product').hide();
  $('.manage-products').hide();
  $('.register').hide();
}

async function manageAccountView() {
  currentUser();
  let token = sessionStorage.getItem('token');
  if (!token) {
    alert('You are not logged in');
    return;
  }
  let userName = sessionStorage.getItem('user-name');
  let userEmail = sessionStorage.getItem('user-email');

  $('#manage-account-email-input').prop('placeholder', userEmail);
  $('#manage-account-name-input').prop('placeholder', userName);

  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.showcase').hide();
  $('.add-farm').hide();
  $('.login').hide();
  $('.update-password').hide();
  $('.manage-reviews').hide();
  $('.reset-password').hide();
  $('.manage-account').show();
  $('.register').hide();
  $('.homepageNav').hide();
  $('.add-product').hide();
  $('.manage-products').hide();
  $('.userNav').show();
}

async function manageProductsView() {
  currentUser();
  if (sessionStorage.getItem('user-role')) {
    if (
      sessionStorage.getItem('user-role') !== 'farmer' &&
      sessionStorage.getItem('user-role') !== 'farm-publisher'
    ) {
      alert('Not authorized to access route');
      return;
    }
  }
  let farm = JSON.parse(sessionStorage.getItem('farm'))[0];
  if (!farm) {
    alert('First add farm');
    return;
  } else {
    $('#manage-products-farm-name').html(
      farm.name +
        '<span class="float-right badge badge-success" id="manage-products-farm-rating">rating</span>'
    );
    if (farm.averageRating === undefined) {
    } else {
      $('#manage-products-farm-rating').html(farm.averageRating);
    }
    $('.manage-products-farm-address').html(
      farm.location.city + ', ' + farm.location.state
    );
  }
  getProductsOfFarm(farm.id, 'manage');
  $('.manage-products-farm-description').html(farm.description);
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.showcase').hide();
  $('.add-farm').hide();
  $('.login').hide();
  $('.update-password').hide();
  $('.manage-reviews').hide();
  $('.reset-password').hide();
  $('.manage-account').hide();
  $('.register').hide();
  $('.homepageNav').hide();
  $('.add-product').hide();
  $('.manage-products').show();
  $('.userNav').show();
}

async function addProductView(context) {
  currentUser();
  let farm = JSON.parse(sessionStorage.getItem('farm'))[0];

  if (sessionStorage.getItem('user-role')) {
    if (
      sessionStorage.getItem('user-role') !== 'farmer' &&
      sessionStorage.getItem('user-role') !== 'farm-publisher'
    ) {
      alert('Not authorized to access route');
      return;
    }
  }
  if (context === 'edit') {
    $('#add-product-context-1234567').html('Edit Product');
    $('.add-product-submit').prop('value', 'Update Product');
  } else if (context === 'add') {
    $('#add-product-context-1234567').html('Add Product');
    $('.add-product-submit').prop('value', 'Add Product');
    updateAddProductView(null, context);
  }
  $('#add-product-farm-name').html(farm.name);
  $('.farm').hide();
  $('.read-review').hide();
  $('.write-review').hide();
  $('.manage-farm').hide();
  $('.browse').hide();
  $('.showcase').hide();
  $('.add-farm').hide();
  $('.login').hide();
  $('.update-password').hide();
  $('.manage-reviews').hide();
  $('.reset-password').hide();
  $('.manage-account').hide();
  $('.register').hide();
  $('.homepageNav').hide();
  $('.add-product').show().data('context', context);
  $('.manage-products').hide();
  $('.userNav').show();
}

async function updateAddProductView(product, context) {
  if (context === 'edit') {
    var d = new Date(product.sellBy);

    var date = d.getDate();
    if (date < 10) {
      date = '0' + date;
    }
    var month = d.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    var year = d.getFullYear();

    var dateStr = year + '-' + month + '-' + date;
    $('#add-product-expiry').val(dateStr);
    $('#add-product-title').prop('placeholder', product.title);
    $('#add-product-price').prop('placeholder', '' + product.price);
    $('#add-product-quantity').prop('placeholder', '' + product.quantity);
    $('#add-product-description').prop('placeholder', product.description);
    $('#add-product-form')[0].reset();
    $('#add-product-form').find('input').prop('required', false);
    $('#add-product-form').find('textarea').prop('required', false);
  } else if (context === 'add') {
    $('#add-product-title').prop('placeholder', 'Title');
    $('#add-product-price').prop('placeholder', '' + 'Price');
    $('#add-product-quantity').prop('placeholder', '' + 'Qty.');
    $('#add-product-description').prop('placeholder', 'Description');
    $('#add-product-form').find('input').prop('required', true);
    $('#add-product-form').find('.add-product-photo').prop('required', false);
    $('#add-product-form').find('textarea').prop('required', true);
  }
}

async function setupPagination(pagination) {
  if (pagination.next) {
    $('#next-page').html(pagination.next.page) + '';
    $('#current-page').html(pagination.next.page - 1 + '');
    $('#next-page-link').data('data', pagination.next);
    $('#next-page-link').show();
    $('#next-page').closest('li').show();
  } else {
    $('#next-page-link').hide();
    $('#next-page').closest('li').hide();
  }

  if (pagination.prev) {
    $('#previous-page').html(pagination.prev.page + '');
    $('#current-page').html(pagination.prev.page + 1 + '');
    $('#previous-page-link').data('data', pagination.prev);
    $('#previous-page-link').show();
    $('#previous-page').closest('li').show();
  } else {
    $('#previous-page-link').hide();
    $('#previous-page').closest('li').hide();
  }

  if (!pagination.prev && !pagination.next) {
    $('#previous-page-link').hide();
    $('#current-page').html('1');
    $('#next-page-link').hide();
  }
  if (sessionStorage.getItem('count') < 4) {
    $('#next-page-link').hide();
    $('#next-page').closest('li').hide();
    $('#previous-page').closest('li').hide();
  }
}
