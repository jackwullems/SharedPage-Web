import Login from '../views/authentication/login';
import Register from '../views/authentication/register';

var authRoutes = [
 
   { path: '/login', name: 'Login with Firebase', icon: 'mdi mdi-account-key', component: Login },
   { path: '/register', name: 'Register with Firebase', icon: 'mdi mdi-account-plus', component: Register },
];
export default authRoutes; 