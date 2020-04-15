import React from 'react';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Input,
	CustomInput,
	FormGroup,
	Form,
	Row,
	Col,
	UncontrolledTooltip,
	Button,
	Alert,
	Spinner,
	Modal, ModalBody
} from 'reactstrap';
import Loader from 'react-loader-spinner'
import {auth} from '../../firebase/firebase';
import img1 from '../../assets/images/logo-icon.png';
import img2 from '../../assets/images/background/login-register.jpg';
import img3 from '../../assets/images/background/auth_background_image.png';

const sidebarBackground = {
	backgroundImage: "url(" + img2 + ")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "bottom center",
	top: '70px'
};

const rightbarBackground = {
	backgroundImage: "url(" + img3 + ")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "center"
};

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.handleRecover = this.handleRecover.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
		this.onDismissAlert = this.onDismissAlert.bind(this)
		this.sendVerificationEmail = this.sendVerificationEmail.bind(this)
		this.state = {
			email: '',
			password: '',
			showAlert: false,
			alertMessage: '',
			showEmailWarning: false,
			progressing: false
		}
	}
	
	sendVerificationEmail() {
		const user = auth.currentUser
		user.sendEmailVerification()
		.then(()=>{
			this.setState({showEmailWarning: false})
			return
		})
		.catch(error=>{
			this.setState({showAlert: true, alertMessage: error.message})
			setTimeout(() => {
				this.setState({showAlert: false, alertMessage: ''})
			}, 10000);
	
		})
	}

	onDismissAlert() {
		this.setState({showAlert: false, alertMessage: ''})
	}

	onDismissEmailWarning() {
		this.setState({showEmailWarning: false})
	}

	handleRecover() {
		this.props.history.replace('/recover')
	}

	handleLogin(e) {
		this.setState({progressing: true})
		e.preventDefault();  
		if (this.state.email && this.state.password) {
			auth.signInWithEmailAndPassword(this.state.email, this.state.password)
			.then(()=>{
				const user = auth.currentUser
				if (user == null) {
					return
				}
				if (!user.emailVerified) {
					this.setState({progressing: false, showEmailWarning: true})
					setTimeout(() => {
						this.setState({showEmailWarning: false})
					}, 10000);
					return
				}
				this.props.history.replace('/pages')
			})
			.catch(error=>{
				if (error) {
					this.setState({progressing: false, showAlert: true, alertMessage: error.message})
					setTimeout(() => {
						this.setState({showAlert: false, alertMessage: ''})
					}, 10000);
				}
			})
		}
	}

	componentWillMount() {
		auth.onAuthStateChanged(user=>{
			if (user && user.emailVerified) {
				this.props.history.replace('/pages')
			}
		})
	}

	render() {
		return <div className="">
			{/*--------------------------------------------------------------------------------*/}
			{/*Login Cards*/}
			{/*--------------------------------------------------------------------------------*/}
			<div className="auth-wrapper d-flex no-block justify-content-center align-items-center" style={sidebarBackground}>
				<div className="auth-box on-sidebar" style={rightbarBackground}>
					<div id="loginform">
						<div className="logo">
							<span className="db"><img src={img1} alt="logo" /></span>
							{/* <h5 className="font-medium mb-3">Sign In to Admin</h5> */}
						</div>
						<Row>
							<Col xs="12">
								<Form className="mt-3" id="loginform" >
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-user"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="email" placeholder="Email" required value={this.state.email} onChange={(e)=>{this.setState({email: e.target.value})}}/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-pencil"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="password" placeholder="Password" required value={this.state.password} onChange={(e)=>{this.setState({password: e.target.value})}}/>
									</InputGroup>
									<div className="d-flex no-block align-items-center mb-3">
										<CustomInput type="checkbox" id="exampleCustomCheckbox" label="Remember Me" />
										<div className="ml-auto">
											<a href="#recoverform" id="to-recover" onClick={this.handleRecover} className="forgot float-right"><i className="fa fa-lock mr-1"></i> Forgot pwd?</a>
										</div>
									</div>
									<Row className="mb-3">
										<Col xs="12">
											<Button color="primary" size="lg" type="submit" block onClick={this.handleLogin}>
												<Loader
													style={{display: 'inline', marginRight: '10'}}
													type="Bars"
													color="white"
													visible={this.state.progressing}
													height="25"
													width="25"
												/>
												Log In
											</Button>
										</Col>
									</Row>
									<div className="text-center mb-2">
										<div className="social">
											<Button id="UncontrolledTooltipExample1" className="btn-facebook mr-2" color="primary">
												<i aria-hidden="true" className="fab fa-facebook-f"></i>
											</Button>
											<UncontrolledTooltip placement="top" target="UncontrolledTooltipExample1">
												Facebook</UncontrolledTooltip>
											<Button id="UncontrolledTooltipExample2" className="btn-googleplus" color="danger">
												<i aria-hidden="true" className="fab fa-google-plus-g"></i>
											</Button>
											<UncontrolledTooltip placement="top" target="UncontrolledTooltipExample2">
												Google Plus</UncontrolledTooltip>
										</div>
									</div>
									<div className="text-center">
										Don&apos;t have an account? <a href="/register" className="text-info ml-1"><b>Sign Up</b></a>
									</div>
								</Form>
							</Col>
						</Row>
					</div>
					<Alert color="danger" isOpen={this.state.showAlert} toggle={this.onDismissAlert}>
						{this.state.alertMessage}
					</Alert>
					<Alert color="warning" isOpen={this.state.showEmailWarning} toggle={this.onDismissEmailWarning}>
					You have to verify email account. You have got email for verification? <p><a href="#" className="text-info ml-1" onClick={this.sendVerificationEmail}><b>Resend verification email</b></a></p>
					</Alert>
 				</div>
			</div>
		</div>;
	}
}

export default Login;
