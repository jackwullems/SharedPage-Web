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
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

import {auth} from '../../firebase/firebase';
import img1 from '../../assets/images/logo-icon.png';
import img2 from '../../assets/images/background/login-register.jpg';
import img3 from '../../assets/images/background/auth_background_image.png';
import OverlayLoader from 'react-overlay-loading/lib/OverlayLoader'

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

class Recover extends React.Component {
	constructor(props) {
		super(props);
		this.handleReset = this.handleReset.bind(this);
		this.onDismissAlert = this.onDismissAlert.bind(this)
		this.state = {
			email: '',
			showAlert: false,
			alertMessage: '',
		}
	}
	
	onDismissAlert() {
		this.setState({showAlert: false, alertMessage: ''})
	}

    toggleInfo() {
		this.props.history.replace('/login')
		return
	}


	handleReset(e) {
		this.setState({progressing: true})
		e.preventDefault();  
		if (this.state.email) {
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
			<OverlayLoader 
				color={'#22B573'} // default is white
				loader="ScaleLoader" // check below for more loaders
				text="Please wait..." 
				active={this.state.progressing} 
				backgroundColor={'black'} // default is black
				opacity=".4" // default is .9  
				>
			{/*--------------------------------------------------------------------------------*/}
			{/*Login Cards*/}
			{/*--------------------------------------------------------------------------------*/}
			<div className="auth-wrapper d-flex no-block justify-content-center align-items-center" style={sidebarBackground}>
				<div className="auth-box on-sidebar" style={rightbarBackground}>
					<div id="recoverform">
						<div className="logo">
							<span className="db"><img src={img1} alt="logo" /></span>
							{/* <h5 className="font-medium mb-3">Recover Password</h5> */}
							<p>Enter your Email and instructions will be sent to you!</p>
						</div>
						<Row className="mt-3">
							<Col xs="12">
								<Form>
									<FormGroup>
										<Input type="email" name="email" bsSize="lg" id="Name" placeholder="Email" required onChange={(e)=>{this.setState({email: e.target.value.trim()})}}/>
									</FormGroup>
									<Row className="mt-3">
										<Col xs="12">
											<Button color="danger" size="lg" type="submit" block onClick={this.handleReset}>Reset</Button>
										</Col>
									</Row>
								</Form>
							</Col>
						</Row>
					</div>
					<Alert color="danger" isOpen={this.state.showAlert} toggle={this.onDismissAlert}>
						{this.state.alertMessage}
					</Alert>
					<Modal isOpen={this.state.showInfo} className={this.props.className}>
						<ModalHeader>Success</ModalHeader>
						<ModalBody>
							Password reset email has sent to you. Check your email box please
						</ModalBody>
						<ModalFooter>
							<Button color="primary" onClick={this.toggleInfo.bind(this)}>Go to Signin</Button>{' '}
						</ModalFooter>
					</Modal>
 				</div>
			</div>
			</OverlayLoader>
		</div>;
	}
}

export default Recover;
