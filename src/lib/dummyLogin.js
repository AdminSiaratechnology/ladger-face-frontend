let data=[
     {
    "name": "Super Admin",
    "email": "superadmin@example.com",
    "password": "hashedpassword123",
    "role": "SuperAdmin",
    "subRole": ["superadmin_adminteam"],
    "company": null,
    "createdBy": null
  },
    {
  
  "name": "Partner 1",
  "email": "partner1@example.com",
  "password": "partnerpass",
  "role": "Partner",
  "subRole": ["partner_admin"],
  "createdBy": "68bff07b216aa6756e8c629e"


},
{
  
  "name": "Partner 2",
  "email": "partner2@example.com",
  "password": "partnerpass",
  "role": "Partner",
  "subRole": ["partner_admin"],
  "createdBy": "68bff07b216aa6756e8c629e"


},
{
  "name": "Client B",
  "email": "clientB@example.com",
  "password": "clientpass",
  "role": "Client",
  "subRole": ["client"],
  "createdBy": "68c12d9d6bfbb49d2a19db42"
},
{
  "name": "Agent 2",
  "email": "agent2@example.com",
  "password": "agentpass",
  "role": "Agent",
  "subRole": ["agent"],
  "createdBy": "68c12d9d6bfbb49d2a19db42"
}
,
{
  "name": "Client One",
  "email": "clientone@example.com",
  "password": "hashedpassword123",
  "role": "Client",
  "subRole": ["client"],
  "parent": "68c12ca56bfbb49d2a19db3f",
  "createdBy": "68c12ca56bfbb49d2a19db3f",
  "clientAgent": "AGENT_ID"   // ye baad me update hoga jab Agent create hoga
},
{
  "name": "Agent John",
  "email": "agent@example.com",
  "password": "hashedpassword123",
  "role": "Agent",
  "subRole": ["agent"],
  "parent": "68c149e06bfbb49d2a19db51",
  "createdBy": "68c149e06bfbb49d2a19db51"
}



]