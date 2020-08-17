const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Test route
// @access  Private
router.get("/me", auth, async (req,res) => {
  try {  
    const profile = await Profile.findOne({ user: req.user.id }).populate(
        'user',
        ['name', 'avatar']
    );

    if(!profile) {
      res.status(400).json({ error: [{ msg: "There is no profile for this user" }] });  
    }

    return res.json(profile);
  } catch(err) {
    console.log(err.message);
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
});

// @route   POST api/profile/
// @desc    Update or create a profile
// @access  Private
router.post('/', [
    auth,
    check('status', "status must exist").not().isEmpty(),
    check('skills',  "skills must exist").not().isEmpty()
  ], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
    } = req.body;

    const profileFields = {}
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (website) profileFields.website = website;
    if (githubusername) profileFields.githubusername = githubusername;
    if (status) profileFields.status = status;

    if(skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try{ 
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile){
        //update
        profile = await Profile.findOneAndUpdate(
          {user: req.user.id }, 
          { $set: profileFields },
          {new: true}
        );
        
        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);
      
      await profile.save();

      res.json(profile);
    } catch(err) {
      console.log(err.message)
      res.status(500).json({ error: [{ msg: "Server error" }] })
    }

  }
);

// @route   get api/profile/
// @desc    Get profiles
// @access  Public
router.get('/', async (req, res) =>{
  try {
    const profiles = await Profile.find().populate('user',
      ['name', 'avatar']
    );

    res.json(profiles);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   get api/profile/user/:user_id
// @desc    Get profiles
// @access  Public
router.get('/user/:user_id', async (req, res) =>{
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user',
      ['name', 'avatar']
    );

    if(!profile) {
      return res.status(400).json({msg: "profile not present"});
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message)
    if(err.kind == "ObjectId") {
      return res.status(400).json({msg: "profile not present"});
    }
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   delete api/profile/
// @desc    Get profiles
// @access  Private
router.delete('/', auth, async (req, res) =>{
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ "msg": "User deleted" });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   put api/profile/experiance
// @desc    Get profiles
// @access  Private
router.put('/experience', [
  auth,
  check('title', "title must exist").not().isEmpty(),
  check('company',  "company must exist").not().isEmpty(),
  check('from',  "from must exist").not().isEmpty()
], async (req, res) =>{

  const error = validationResult(req);
  if(!error.isEmpty()){
    return req.status(400).json({ error: error.array() })
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(newExp);
    
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   delete api/profile/experience/:exp_id
// @desc    Get profiles
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) =>{
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const experienceIndex = profile.experience.map( exp => exp.id).indexOf(req.params.exp_id);

    profile.experience.splice(experienceIndex, 1)

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   put api/profile/education
// @desc    update education
// @access  Private
router.put('/education', [
  auth,
  check('school', "school must exist").not().isEmpty(),
  check('degree',  "degree must exist").not().isEmpty(),
  check('fieldofstudy',  "Field of study must exist").not().isEmpty(),
  check('from',  "from of study must exist").not().isEmpty()
], async (req, res) =>{

  const error = validationResult(req);
  if(!error.isEmpty()){
    return req.status(400).json({ error: error.array() })
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.education.unshift(newEdu);
    
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})

// @route   delete api/profile/education/:exp_id
// @desc    delete education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) =>{
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const educationIndex = profile.education.map( edu => edu.id).indexOf(req.params.edu_id);

    profile.education.splice(educationIndex, 1)

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})


// @route   get api/profile/github/:username
// @desc    get github profile
// @access  Public
router.get("/github/:username", async(req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created_at:asc&client_id=${
        config.get('githubClientId')
      }&client_secret=${
        config.get('githubClientSecret')
      }`,
      method: "GET",
      headers: { "user-agent": "node.js" } 
    }
    
    request.get(options, (error, response, body) => {
      if(error) console.log(error)

      if(response.statusCode !== 200) {
        res.status(404).json({ msg: "No github profile not found" })
      }

      res.json(JSON.parse(body));
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: [{ msg: "Server error" }] })
  }
})


module.exports = router;