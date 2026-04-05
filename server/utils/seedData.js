const { User } = require('../models/User');
const { Outlet } = require('../models/Outlet');
const { MenuItem } = require('../models/MenuItem');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create Super Admin (only if doesn't exist)
    let superAdmin = await User.findOne({ email: 'admin@campusbite.com' });
    if (!superAdmin) {
      superAdmin = new User({
        name: 'Super Admin',
        email: 'admin@campusbite.com',
        password: 'admin123',
        role: 'super_admin',
        isVerified: true
      });
      await superAdmin.save();
      console.log('Created Super Admin');
    } else {
      console.log('Super Admin already exists');
    }

    // Outlet data
    const outlets = [
      {
        name: 'Hotspot (Nescafe)',
        description: 'Premium coffee and quick bites',
        image: '/images/outlets/hotspot.jpg',
        address: 'Main Block, Ground Floor',
        phone: '9876543210',
        email: 'hotspot@bennett.edu.in',
        prepTime: 15,
        operatingHours: { opening: '08:00', closing: '22:00' },
        menuCategories: ['Coffee', 'Snacks', 'Beverages', 'Sandwiches']
      },
      {
        name: 'Southern Stories',
        description: 'Authentic South Indian cuisine',
        image: '/images/outlets/southern-stories.jpg',
        address: 'Food Court, First Floor',
        phone: '9876543211',
        email: 'southern@bennett.edu.in',
        prepTime: 20,
        operatingHours: { opening: '09:00', closing: '21:00' },
        menuCategories: ['South Indian', 'Dosas', 'Meals', 'Beverages']
      },
      {
        name: 'Snap Eat',
        description: 'Quick meals and fast food',
        image: '/images/outlets/snap-eat.jpg',
        address: 'Near Library',
        phone: '9876543212',
        email: 'snap@bennett.edu.in',
        prepTime: 12,
        operatingHours: { opening: '10:00', closing: '20:00' },
        menuCategories: ['Fast Food', 'Burgers', 'Pizza', 'Rolls']
      },
      {
        name: 'Kathi Junction',
        description: 'Kathi rolls and wraps',
        image: '/images/outlets/kathi-junction.jpg',
        address: 'Academic Block, Ground Floor',
        phone: '9876543213',
        email: 'kathi@bennett.edu.in',
        prepTime: 18,
        operatingHours: { opening: '11:00', closing: '19:00' },
        menuCategories: ['Kathi Rolls', 'Wraps', 'Beverages', 'Desserts']
      },
      {
        name: 'House of Chow',
        description: 'Chinese and Asian cuisine',
        image: '/images/outlets/house-of-chow.jpg',
        address: 'Food Court, Second Floor',
        phone: '9876543214',
        email: 'chow@bennett.edu.in',
        prepTime: 25,
        operatingHours: { opening: '12:00', closing: '22:00' },
        menuCategories: ['Chinese', 'Noodles', 'Rice', 'Starters']
      }
    ];

    const createdOutlets = [];
    for (const outletData of outlets) {
      // Check if outlet admin exists
      let admin = await User.findOne({ email: outletData.email });
      
      if (!admin) {
        // Create outlet admin
        admin = new User({
          name: `${outletData.name} Admin`,
          email: outletData.email,
          password: 'admin123',
          role: 'outlet_admin',
          isVerified: true
        });
        await admin.save();
        console.log(`Created outlet admin: ${admin.email}`);
      } else {
        console.log(`Outlet admin already exists: ${admin.email}`);
      }

      // Check if outlet exists
      let outlet = await Outlet.findOne({ email: outletData.email });
      
      if (!outlet) {
        // Create outlet
        outlet = new Outlet({
          ...outletData,
          adminId: admin._id
        });
        await outlet.save();
        console.log(`Created outlet: ${outlet.name}`);
      } else {
        console.log(`Outlet already exists: ${outlet.name}`);
      }
      
      createdOutlets.push(outlet);
    }

    // Menu items data
    const menuItems = {
      'Hotspot (Nescafe)': [
        { name: 'Cappuccino', price: 80, category: 'Coffee', isVeg: true, prepTime: 5 },
        { name: 'Cold Coffee', price: 90, category: 'Beverages', isVeg: true, prepTime: 5 },
        { name: 'Veg Sandwich', price: 60, category: 'Sandwiches', isVeg: true, prepTime: 8 },
        { name: 'Paneer Wrap', price: 120, category: 'Snacks', isVeg: true, prepTime: 10 }
      ],
      'Southern Stories': [
        { name: 'Masala Dosa', price: 90, category: 'Dosas', isVeg: true, prepTime: 15 },
        { name: 'Idli Sambar', price: 60, category: 'South Indian', isVeg: true, prepTime: 10 },
        { name: 'South Indian Thali', price: 150, category: 'Meals', isVeg: true, prepTime: 20 },
        { name: 'Filter Coffee', price: 40, category: 'Beverages', isVeg: true, prepTime: 5 }
      ],
      'Snap Eat': [
        { name: 'Veg Burger', price: 80, category: 'Burgers', isVeg: true, prepTime: 8 },
        { name: 'Cheese Pizza', price: 180, category: 'Pizza', isVeg: true, prepTime: 15 },
        { name: 'Veg Roll', price: 70, category: 'Rolls', isVeg: true, prepTime: 10 },
        { name: 'French Fries', price: 60, category: 'Fast Food', isVeg: true, prepTime: 8 }
      ],
      'Kathi Junction': [
        { name: 'Paneer Kathi Roll', price: 110, category: 'Kathi Rolls', isVeg: true, prepTime: 12 },
        { name: 'Mixed Veg Wrap', price: 90, category: 'Wraps', isVeg: true, prepTime: 10 },
        { name: 'Aloo Tikki Roll', price: 80, category: 'Kathi Rolls', isVeg: true, prepTime: 10 },
        { name: 'Fresh Lime Soda', price: 40, category: 'Beverages', isVeg: true, prepTime: 3 }
      ],
      'House of Chow': [
        { name: 'Hakka Noodles', price: 120, category: 'Noodles', isVeg: true, prepTime: 15 },
        { name: 'Fried Rice', price: 110, category: 'Rice', isVeg: true, prepTime: 12 },
        { name: 'Spring Rolls', price: 80, category: 'Starters', isVeg: true, prepTime: 10 },
        { name: 'Manchurian', price: 140, category: 'Starters', isVeg: true, prepTime: 15 }
      ]
    };

    for (const outlet of createdOutlets) {
      const items = menuItems[outlet.name] || [];
      
      for (const itemData of items) {
        // Check if menu item exists
        const existingItem = await MenuItem.findOne({ 
          outletId: outlet._id,
          name: itemData.name
        });
        
        if (!existingItem) {
          const menuItem = new MenuItem({
            outletId: outlet._id,
            name: itemData.name,
            description: `Delicious ${itemData.name.toLowerCase()} from ${outlet.name}`,
            price: itemData.price,
            image: '',
            category: itemData.category,
            isVeg: itemData.isVeg,
            prepTime: itemData.prepTime,
            isAvailable: true
          });
          await menuItem.save();
        }
      }
      
      console.log(`Menu items checked for: ${outlet.name}`);
    }

    // Create sample students (only if don't exist)
    const students = [
      { name: 'John Doe', email: 'john@bennett.edu.in', phone: '9876543201' },
      { name: 'Jane Smith', email: 'jane@bennett.edu.in', phone: '9876543202' },
      { name: 'Mike Johnson', email: 'mike@bennett.edu.in', phone: '9876543203' }
    ];

    for (const studentData of students) {
      let student = await User.findOne({ email: studentData.email });
      
      if (!student) {
        student = new User({
          ...studentData,
          password: 'student123',
          role: 'student',
          isVerified: true
        });
        await student.save();
        console.log(`Created student: ${student.email}`);
      } else {
        console.log(`Student already exists: ${student.email}`);
      }
    }

    console.log('\nDatabase seeding completed successfully!');
    console.log('Login credentials:');
    console.log('Super Admin: admin@campusbite.com / admin123');
    console.log('Outlet Admins: hotspot@bennett.edu.in / admin123 (and other outlet emails)');
    console.log('Students: john@bennett.edu.in / student123 (and other student emails)');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };
