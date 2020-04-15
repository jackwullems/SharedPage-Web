import React from 'react';
import {
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	CustomInput,
	FormGroup,
	Form,
	Row,
	Col,
	Button,
	Alert,
	Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import img1 from '../../assets/images/logo-icon.png';
import img2 from '../../assets/images/background/login-register.jpg';
import img3 from '../../assets/images/background/auth_background_image.png';
import {auth} from '../../firebase/firebase';
import * as db from '../../firebase/db'

const sidebarBackground = {
	backgroundImage: "url(" + img2 + ")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "bottom center"
};

const rightbarBackground = {
	backgroundImage: "url(" + img3 + ")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "center"
};

class Register extends React.Component {
	state = {
		email: '',
		password: '',
		confirmPassword: '',
		showAlert: false,
		alertMessage: '',
		showWarning: false,
		warningMessage: '',
		showInfo: false,
		agreeTerm: false
	}
	
	toggleInfo() {
		this.props.history.replace('/login')
		return
	}

	handleAgree(e) {
		this.setState({agreeTerm: e.target.value})
	}
	handleSignup(e) {
		e.preventDefault()
		if (this.state.password !== this.state.confirmPassword) {
			this.setState({showAlert: true, alertMessage: 'Passwords are not matched'})
			setTimeout(() => {
				this.setState({showAlert: false, alertMessage: ''})
			}, 10000);
			return
		}
		if (!this.state.agreeTerm) {
			this.setState({showAlert: true, alertMessage: 'You have to agree to Terms of Service'})
			setTimeout(() => {
				this.setState({showAlert: false, alertMessage: ''})
			}, 10000);
			return
		}
		auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
		.then(()=>{
			const user = auth.currentUser
			db.createUser(user.uid, this.state.name, this.state.email)
			user.sendEmailVerification()
			.then(()=>{
				this.setState({showInfo: true})
				return
			})
		})
		.catch(error=>{
			this.setState({showAlert: true, alertMessage: error.message})
			setTimeout(() => {
				this.setState({showAlert: false, alertMessage: ''})
			}, 10000);
			return
		})
	}

	onDismissAlert() {
		this.setState({showAlert: false, alertMessage: ''})
	}

	onDismissWarning() {
		this.setState({showWarning: false, warningMessage: ''})
	}

	onDismissInfo() {
		this.setState({showInfo: false, infoMessage: ''})
	}

	render() {
		return <div className="">
			{/*--------------------------------------------------------------------------------*/}
			{/*Register Cards*/}
			{/*--------------------------------------------------------------------------------*/}
			<div className="auth-wrapper d-flex no-block justify-content-center align-items-center" style={sidebarBackground}>
				<div className="auth-box on-sidebar" style={rightbarBackground}>
					<div id="loginform">
						<div className="logo">
							<span className="db"><img src={img1} alt="logo" /></span>
							{/* <h5 className="font-medium mb-3">Sign Up to Admin</h5> */}
						</div>
						<Row>
							<Col xs="12">
								<Form className="mt-3" id="loginform" action="/dashbaord">
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-user"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="text" placeholder="Username" required value={this.state.name} onChange={(e)=>{this.setState({name: e.target.value.trim()})}}/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-user"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="email" placeholder="Email" required value={this.state.email} onChange={(e)=>{this.setState({email: e.target.value.trim()})}}/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-pencil"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="password" placeholder="Password" required value={this.state.password} onChange={(e)=>{this.setState({password: e.target.value})}}/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroupAddon addonType="prepend">
											<InputGroupText>
												<i className="ti-pencil"></i>
											</InputGroupText>
										</InputGroupAddon>
										<Input type="password" placeholder="Confirm Password" required value={this.state.passconfirmPasswordword} onChange={(e)=>{this.setState({confirmPassword: e.target.value})}}/>
									</InputGroup>
									<CustomInput type="checkbox" id="exampleCustomCheckbox" label="I agree to Terms of Service" value={this.state.agreeTerm} onChange={this.handleAgree.bind(this)}/>
									<Row className="mb-3 mt-3">
										<Col xs="12">
											<Button color="primary" size="lg" className="text-uppercase" type="submit" block onClick={this.handleSignup.bind(this)}>Sign Up</Button>
										</Col>
									</Row>
									<div className="text-center">
										Already have an account? <a href="/login" className="text-info ml-1"><b>Sign In</b></a>
									</div>
								</Form>
							</Col>
						</Row>
					</div>
					<Alert color="danger" isOpen={this.state.showAlert} toggle={this.onDismissAlert}>
						{this.state.alertMessage}
					</Alert>
					<Alert color="warning" isOpen={this.state.showWarning} toggle={this.onDismissWarning}>
						{this.state.warningMessage}
					</Alert>
					<Modal isOpen={this.state.showInfo} className={this.props.className}>
						<ModalHeader>Success</ModalHeader>
						<ModalBody>
							You can login after verification of your email. Check your email box for veritication.
						</ModalBody>
						<ModalFooter>
							<Button color="primary" onClick={this.toggleInfo.bind(this)}>Go to Signin</Button>{' '}
						</ModalFooter>
					</Modal>
				</div>
			</div>
		</div>;
	}
}

export default Register;
