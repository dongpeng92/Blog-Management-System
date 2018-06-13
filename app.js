function throttle(fn, wait) {
    var time = Date.now();
    return function() {
        if ((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    }
}

var showPost = function () {
    var html = "";

    // // 已经加载了多少个
    var offset = jQuery("posts tr").length;

    var posts = JSON.parse(localStorage.a_posts);
    var comments = JSON.parse(localStorage.a_comments);
    var users = JSON.parse(localStorage.a_users);
    var likes = JSON.parse(localStorage.a_likes);

    // show 20 lines
    for(var i=0; i<20 && (i+offset) < posts.length; i++){
        html += `
             <tr id="tr_${i+offset}">
                <td>
                    <h4>Username: ${users[posts[i+offset].userId-1].username}</h4><br />
                   <h3>Title: ${posts[i+offset].title}</h3><br />
                   <p>Description: ${posts[i+offset].body}</p><br />
                   <p>
                        <!--disabled="${likes[posts[i+offset].postId]}"-->
                        <button id="like_btn_${i+offset}">Like</button>
                        <button id="comment_btn_${i+offset}">Comments</button>
                        <button id="del_btn_${i+offset}">Delete</button>
                   </p>
                </td>
             </tr>`;
    };
    document.getElementById("posts").insertAdjacentHTML('beforeend', html);

}

if(!localStorage.a_users || !localStorage.a_posts || !localStorage.a_comments){
    jQuery(document).on('click', 'button[id="get_data"]', function () {
        jQuery.ajax({
            type: "GET",
            url: "https://jsonplaceholder.typicode.com/posts",
            success: function (posts) {
                localStorage.setItem("a_posts", JSON.stringify(posts));
                console.log("hello1");
                jQuery.ajax({
                    type: "GET",
                    url: "https://jsonplaceholder.typicode.com/comments",
                    success: function (comments) {
                        localStorage.setItem("a_comments", JSON.stringify(comments));
                        console.log("hello2");
                        jQuery.ajax({
                            type: "GET",
                            url: "https://jsonplaceholder.typicode.com/users",
                            success: function (users) {
                                localStorage.setItem("a_users", JSON.stringify(users));
                                var likes = [];
                                localStorage.setItem("a_likes", JSON.stringify(likes));
                                console.log("hello3");
                                showPost();
                                showPost = throttle(showPost, 1000);
                            },
                            error: function (err) {
                                console.log(err);
                            }
                        });
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
} else {
    var div =document.getElementById("get_post");
    div.parentNode.removeChild(div);
    showPost();
    showPost = throttle(showPost, 1000);
}

// scroll function
function scroll() {
    var scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    if ( (scrollY + window.innerHeight) >= (document.body.offsetHeight - 20)) {
        showPost();
    }
}

// show comments button
jQuery(document).on('click', 'button[id^="comment_btn_"]', function () {
    var tr_id = jQuery(this).attr('id').replace('comment_btn_', 'tr_');
    var tr_details = tr_id.replace('tr_', 'tr_details_');
    var id = tr_id.replace('tr_', '');

    var find_comments = findComments(id+1);
    console.log(find_comments);

    if(jQuery("tr[id=" + tr_details +"]").length == 0) {
        var html=`<tr id="${tr_details}">
                    <td>`;

        for(var i=0; i<find_comments.length; i++) {
            html += `<p>${i}: ${find_comments[i].body}</p>`;
        }

        html += `<input style="width:800px" type="text" placeholder="add new comments" />
                 <button>Submit</button>
                </td>
              </tr>`;
        jQuery("#"+tr_id).after(html);
    } else {
        jQuery("tr[id=" + tr_details +"]").remove();
    }
});

function findComments(id) {
    var find_comments=[];
    var comments = JSON.parse(localStorage.a_comments);
    for(var i=0; i<comments.length; i++){
        if(comments[i].postId == id){
            find_comments.push(comments[i]);
        }
    }
    return find_comments;
}

// delete button
jQuery(document).on('click', 'button[id^="del_btn_"]', function () {
    var tr_id = jQuery(this).attr('id').replace('del_btn_', 'tr_');
    var tr_details = tr_id.replace('tr_', 'tr_details_');
    var id = tr_id.replace('tr_', '');

    var post_local = JSON.parse(localStorage.a_posts);
    post_local.splice(id, 1);
    localStorage.a_posts = JSON.stringify(post_local);

    jQuery("#"+tr_id).remove();
    jQuery("tr[id=" + tr_details +"]").remove();

    showPost();
});

// like button
jQuery(document).on('click', 'button[id^="like_btn_"]', function () {
    var tr_id = jQuery(this).attr('id').replace('like_btn_', 'tr_');
    var id = tr_id.replace('tr_', '');

    var likes = JSON.parse(localStorage.a_likes);
    var posts = JSON.parse(localStorage.a_posts);
    var like= {
        "postId": posts[id].id,
        "liked": true
    };
    document.getElementById("like_btn_"+id).disabled=true;

    likes.push(like);
    localStorage.a_likes = JSON.stringify(likes);

    showPost();
});

window.addEventListener('scroll', scroll);
