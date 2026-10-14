'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/RecyclingCompany');
const Pickup = require('../models/PickupRequest');
const Redemption = require('../models/Redemption');

const uri = process.env.TEST_MONGO_URI;
if (!uri) {
  test('MongoDB security integration (requires isolated TEST_MONGO_URI)', {skip: true}, () => {});
} else {
  test('authorized pickup lifecycle, exactly-once points and atomic redemption', async () => {
    assert.equal(new URL(uri).pathname, '/waste2wealth_security_test', 'Refusing to use a non-test database');
    process.env.JWT_SECRET = 'test-only-integration-secret-not-for-production';
    await mongoose.connect(uri, {serverSelectionTimeoutMS: 10000});
    const app = express();
    app.use(express.json());
    app.use('/api/users', require('../routes/users'));
    app.use('/api/recyclables', require('../routes/recyclables'));
    app.use('/api/companies', require('../routes/companies'));
    app.use('/api/company-auth', require('../routes/companyAuth'));
    app.use('/api/company', require('../routes/companyPortal'));
    app.use('/api/pickups', require('../routes/pickups'));
    app.use('/api/admin', require('../routes/admin'));
    app.use('/api/redemptions', require('../routes/redemptions'));
    const server = await new Promise(resolve => {
      const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    });
    const base = 'http://127.0.0.1:' + server.address().port;
    const nonce = String(Date.now()) + Math.random().toString(36).slice(2);
    const request = async (path, method, body, token) => {
      const response = await fetch(base + path, {
        method, headers: {'content-type':'application/json', ...(token ? {authorization:'Bearer ' + token} : {})},
        ...(body ? {body: JSON.stringify(body)} : {})
      });
      return {status: response.status, data: await response.json()};
    };
    try {
      const register = await request('/api/users/register', 'POST', {name:'Security Tester',email:'tester'+nonce+'@example.test', password:'Passw0rd-Test!'});
      assert.equal(register.status, 201);
      const user = await User.findOne({email:'tester'+nonce+'@example.test'});
      const userToken = jwt.sign({userId:user.id,role:'user'}, process.env.JWT_SECRET, {expiresIn:'1h'});
      const invalidLogin = await request('/api/users/login','POST',{email:user.email,password:'incorrect'});
      assert.equal(invalidLogin.status,401,'Wrong user password must be rejected');
      const unauthenticated = await request('/api/pickups','GET');
      assert.equal(unauthenticated.status,401,'Unauthenticated pickup history denied');
      const admin = await User.create({name:'Security Admin',email:'admin'+nonce+'@example.test',password:'test-only',role:'admin'});
      const adminToken = jwt.sign({userId:admin.id,role:'admin'}, process.env.JWT_SECRET, {expiresIn:'1h'});
      const companyRegistration = await request('/api/company-auth/register','POST',{
        companyName:'Security Recycling',email:'company'+nonce+'@example.test',
        password:'Passw0rd-Test!',phone:'08000000000',address:'Test Street',city:'Ado Ekiti',state:'Ekiti',
        materialsAccepted:['plastic'],pickupAvailable:true,verified:true,accountActive:true
      });
      assert.equal(companyRegistration.status,201);
      const companyId = companyRegistration.data.company._id;
      assert.equal(companyRegistration.data.company.verified,false,'Public company registration must not self-approve');
      const login = await request('/api/company-auth/login','POST',{email:'company'+nonce+'@example.test',password:'Passw0rd-Test!'});
      assert.equal(login.status,200);
      const companyToken = login.data.token;
      const badCompanyLogin = await request('/api/company-auth/login','POST',{email:'company'+nonce+'@example.test',password:'bad password'});
      assert.equal(badCompanyLogin.status,401,'Company rejects invalid credentials');
      const pickupBody = {companyId,material:'plastic',estimatedWeight:12,pickupAddress:'Sample Address',
        city:'Ado Ekiti',state:'Ekiti',phone:'08000000000',preferredDate:new Date(Date.now()+86400000).toISOString()};
      const pending = await request('/api/pickups','POST',pickupBody,userToken);
      assert.equal(pending.status,403,'Unverified company cannot receive new pickups');
      const forbidden = await request('/api/admin/companies/'+companyId+'/verification','PATCH',{verified:true},userToken);
      assert.equal(forbidden.status,403,'User cannot approve a company');
      const prohibitedCreation = await request('/api/companies','POST',{
        companyName:'Forged Company',email:'fraud'+nonce+'@example.test',phone:'1234',address:'Test St',city:'Ado',state:'Ekiti',verified:true
      },userToken);
      assert.equal(prohibitedCreation.status,403,'Ordinary user cannot add a company');
      const hiddenCompanies = await request('/api/companies','GET',null,userToken);
      assert.equal(hiddenCompanies.status,200);
      assert.ok(!hiddenCompanies.data.some(c=>String(c._id)===companyId),'Pending company must not appear in directory');
      const approval = await request('/api/admin/companies/'+companyId+'/verification','PATCH',{verified:true},adminToken);
      assert.equal(approval.status,200);
      const created = await request('/api/pickups','POST',pickupBody,userToken);
      assert.equal(created.status,201);
      const id = created.data.pickup._id;
      const intruderCompany = await request('/api/company-auth/register','POST',{
        companyName:'Intruder Company',email:'intruder'+nonce+'@example.test',
        password:'Passw0rd-Test!',phone:'08000000001',address:'Test Street 2',city:'Ado Ekiti',state:'Ekiti',
        materialsAccepted:['plastic'],pickupAvailable:true
      });
      assert.equal(intruderCompany.status,201);
      const intruderLogin = await request('/api/company-auth/login','POST',{email:'intruder'+nonce+'@example.test',password:'Passw0rd-Test!'});
      assert.equal(intruderLogin.status,200);
      const notOwned = await request('/api/company/pickups/'+id+'/status','PATCH',{status:'accepted'},intruderLogin.data.token);
      assert.equal(notOwned.status,403,'Unverified other company may not update pickup');
      const intruderApproval = await request('/api/admin/companies/'+intruderCompany.data.company._id+'/verification','PATCH',{verified:true},adminToken);
      assert.equal(intruderApproval.status,200);
      const wrongCompany = await request('/api/company/pickups/'+id+'/status','PATCH',{status:'accepted'},intruderLogin.data.token);
      assert.equal(wrongCompany.status,404,'Verified company cannot update another company pickup');
      const uploaded = await request('/api/recyclables','POST',{type:'plastic',weight:100},userToken);
      assert.equal(uploaded.status,201);
      assert.equal(uploaded.data.pointsEarned,0,'User upload cannot award points');
      for (const status of ['accepted','collected']) {
        const changed = await request('/api/company/pickups/'+id+'/status','PATCH',{status},companyToken);
        assert.equal(changed.status,200,'Expected allowed transition to '+status);
      }
      const results = await Promise.all(Array.from({length:4},()=>request('/api/company/pickups/'+id+'/status','PATCH',{status:'completed',verifiedWeight:3.5},companyToken)));
      assert.equal(results.filter(r=>r.status===200).length,1,'Exactly one request must complete the pickup');
      assert.equal((await User.findById(user._id)).points,35,'Exactly one award of verified 3.5kg');
      const finalPickup = await Pickup.findById(id);
      assert.equal(finalPickup.pointsAwarded,35);
      assert.equal(finalPickup.pointsProcessed,true);
      const repeatCompletion = await request('/api/company/pickups/'+id+'/status','PATCH',{status:'completed',verifiedWeight:3.5},companyToken);
      assert.equal(repeatCompletion.status,409,'Duplicate completion rejected');
      await User.updateOne({_id:user._id},{$set:{points:500}});
      const redemptionResults = await Promise.all(Array.from({length:3},()=>request('/api/redemptions','POST',{rewardId:'airtime500'},userToken)));
      assert.equal(redemptionResults.filter(r=>r.status===201).length,1,'Only one 500-point redemption');
      assert.equal((await User.findById(user._id)).points,0);
      assert.equal(await Redemption.countDocuments({user:user._id}),1);
      const noFunds = await request('/api/redemptions','POST',{rewardId:'airtime500'},userToken);
      assert.equal(noFunds.status,400,'Insufficient reward balance rejected');
      const disabled = await request('/api/admin/companies/'+companyId+'/account-status','PATCH',{accountActive:false},adminToken);
      assert.equal(disabled.status,200);
      const denied = await request('/api/company/pickups/'+id+'/status','PATCH',{status:'cancelled'},companyToken);
      assert.equal(denied.status,403,'Deactivated company must be denied');
      const companyResults = await request('/api/companies','GET',null,userToken);
      assert.ok(!companyResults.data.some(c=>String(c._id)===companyId),'Inactive company must not appear in directory');
    } finally {
      await new Promise(resolve => server.close(resolve));
      await mongoose.disconnect();
    }
  }, {timeout: 60000});
}
