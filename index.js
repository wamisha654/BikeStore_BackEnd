const port = 400;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// DB connection with MongoDB 
mongoose.connect("mongodb+srv://wami:hode2426@cluster0.td5g0.mongodb.net/MYBIKE");

// API creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Image storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating uploading endpoint
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});



// Define the model based on the schema
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
    color: {
    	type:String,
    	required: true,
    },
    description:{
    	type: String,
    	required: true,
    },
});

// Add product route
app.post('/addproduct', async (req, res) => {
    try {
    	let products = await Product.find({});
    	let id;
    	if(products.length>0){
    		let last_product_array = products.slice(-1);
    		let last_product = last_product_array[0];
    		id=last_product.id+1;
    	}
    	else{
    		id=1;
    	}
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            description:req.body.description,
            color:req.body.color,
        });
        console.log(product);
        await product.save();
        console.log("Product saved");
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

//creating API to remove product

app.post('/removeproduct',async(req,res)=>{
	await Product.findOneAndDelete({id:req.body.id});
	console.log("removed!");
	res.json({
		success:true,
		name:req.body.name
	})
})

//creating API for getting all products

app.get('/allproducts', async(req,res)=>{
	let products = await Product.find({});
	console.log("All products Fetched!");
	res.send(products);
})

//creating schema for user model

const Users = mongoose.model('Users',{
	name:{
		type:String,
	},
	email:{
		type:String,
		unique:true,
	},
	password:{
		type:String,
	},
	cartData:{
		type:Object,
	},
	date:{
		type:Date,
	default:Date.now,
	},
	userType:{
		type:String,
	}
})

//creating Endpoint for registering the user
app.post('/signup',async(req,res)=>{
	let check = await Users.findOne({email:req.body.email});
	if(check){
		return res.status(400).json({success: false, errors:"existing users found with same email"})
	}
	let cart = {};
	for(let i=0; i<300;i++){
       cart[i]=0;
	}
	const user = new Users({
		name:req.body.username,
		email:req.body.email,
		password:req.body.password,
		cartData:cart,
		userType: req.body.userType,
	})

	await user.save();

	const data = {
		user:{
			id: user.id
		}
	}
	const token = jwt.sign(data,'secret_ecom');
	res.json({success:true, token})

})

//creating endpoint for user login

app.post('/login',async(req,res)=>{
	let user = await Users.findOne({email:req.body.email});
	if(user){
		const passCompare = req.body.password === user.password;
		if(passCompare){
			const data = {
				user:{
					id:user.id
				}
			}
			const token = jwt.sign(data,'secret_ecom');
			res.json({success:true, 
				token: token,
			    userType:  user.userType})
		}
		else{
			res.json({success:false,errors:"wrong password"})
		}
	}
	else{
		res.json({success:false,errors:"wrong email"})
	}

})

// Define the appointment model based on the schema

const Appointment = mongoose.model("Appointment", {
    id: {
        type: Number,
        required: true,
    },
    fullName:{
    	type: String,
    	required: true,
    },
    email:{
    	type:String,
    	required:true,
    },
    phoneNumber:{
    	type: Number,
    	required:true
    },
    serviceType: {
        type: String,
        required: true,
    },
    date: {
        type: String,  
        required: true,
    },
    time: {
        type: String,
        required: true,  
    },
    serviceDescription: {
        type: String,
        required: true,
    },
});

// Add appointment route
app.post('/addappointment', async (req, res) => {
    try {
 
        let appointments = await Appointment.find({});

        let id;
        if (appointments.length > 0) {
            let last_appointment = appointments[appointments.length - 1];
            id = last_appointment.id + 1;
        } else {
            id = 1;  
        }

        // Create a new appointment
        const newAppointment = new Appointment({
            id: id,
            fullName: req.body.fullName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            serviceType: req.body.serviceType,
            date: req.body.date,  
            time: req.body.time,
            serviceDescription: req.body.serviceDescription,
        });

        console.log(newAppointment);
        await newAppointment.save();

        console.log("Appointment saved");
        res.json({
            success: true,
            serviceType: req.body.serviceType,
        });

    } catch (error) {
        console.error("Error saving appointment:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//creating API for getting all appointments

app.get('/allappointments', async(req,res)=>{
	let appointments = await Appointment.find({});
	console.log("All appointments Fetched!");
	res.send(appointments);
})

//Remove apppointment
app.post('/removeappointment',async(req,res)=>{
	await Appointment.findOneAndDelete({id:req.body.id});
	console.log("removed!");
	res.json({
		success:true,
		name:req.body.name
	})
})

//create a schema for orders

const Order = mongoose.model("Order", {
    product_name:{
    	type:String,
    	required:true,
    },
    productId:{
    	type:String,
    	required:true,
    },
    image:{
    	type:String,
    	required:true,
    },
    final_price:{
    	type:[Number],
    	required:true,
    },
    delivery:{
    	type:String,
    	required:true,
    },
    name:{
    	type: String,
    	required:true
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,  
        required: true,
    },
    phone: {
        type: String,
        required: true,  
    },
    invoice: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    date:{
		type:Date,
	    default:Date.now,
	},

});

// Add order route
app.post('/order', async (req, res) => {
    try {
        // Create a new appointment
        const newOrder = new Order({
         
            delivery: req.body.delivery,
             final_price: req.body.final_price,
            productId:req.body.productId,
            image:req.body.image,
            product_name: req.body.product_name,
            name:req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            invoice: req.body.invoice,
            address: req.body.address,  
            paymentMethod: req.body.paymentMethod,
            quantity: req.body.quantity,
        });

        console.log(newOrder);
        await newOrder.save();

        console.log("Appointment saved");
        res.json({
            success: true,
            serviceType: req.body.prodId,
        });

    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//creating a schema to list all orders

app.get('/allorders', async(req,res)=>{
	let orders = await Order.find({});
	console.log("All orders Fetched!");
	res.send(orders);
})

//Remove order
app.post('/removeorder',async(req,res)=>{
	await Order.findOneAndDelete({id:req.body.id});
	console.log("removed!");
	res.json({
		success:true,
		name:req.body.name
	})
})

// Start the server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port);
    } else {
        console.log("Error: " + error);
    }
});
