async function requestGet(url, token) {
  let request = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await request.json();
}

async function requestPost(url, request_body) {
  let request = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(request_body),
  });

  return await request.json();
}

// await fetch(url, {
//   method: 'PATCH',
//   headers: {
//     Authorization: `Bearer ${user_token}`,
//     'Content-Type': 'application/json;charset=utf-8',
//   },
//   body: JSON.stringify(new_name),
// });

const request = {
  get: requestGet,
  post: requestPost,
};

export { request };
