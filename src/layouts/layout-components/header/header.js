import React from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import {
	Nav,
	NavItem,
	NavLink,
	Button,
	Navbar,
	NavbarBrand,
	Collapse,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	// UncontrolledCarousel,
	// Progress,
	// ListGroup,
	// ListGroupItem,
	Row,
	Col,
	// Form,
	// FormGroup,
	Input,
	// Badge,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Container
} from 'reactstrap';
import Avatar from "react-avatar-edit"
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import Snackbar from '@material-ui/core/Snackbar'
import CloseIcon from '@material-ui/icons/Close'

import $ from 'jquery'
import * as db from '../../../firebase/db'
import * as storage from '../../../firebase/storage'
import { signin } from '../../../redux/auth/action'
import { setBusiness } from '../../../redux/business/action'
import sharedPageUserImage from '../../../assets/images/users/user.png';
// import * as data from './data';

/*--------------------------------------------------------------------------------*/
/* Import images which are need for the HEADER                                    */
/*--------------------------------------------------------------------------------*/
// import logodarkicon from '../../../assets/images/logo-icon.png';
// import logolighticon from '../../../assets/images/logo-light-icon.png';
// import logodarktext from '../../../assets/images/logo-text.png';
// import logolighttext from '../../../assets/images/logo-light-text.png';
import profilephoto from '../../../assets/images/users/user.png';
import { auth } from '../../../firebase/firebase'
// import sharedpageLogo from '../../../assets/images/logo-icon.png';

class Header extends React.Component {
	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.showMobilemenu = this.showMobilemenu.bind(this);
		this.state = {
			isOpen: false,
			addNewPageModalOpen: false,
			progressing: false,
			editprofileModalOpen: false,
			profilePicture: null,
			profileUserName: '',
			profilePassword1: '',
			profilePassword2: '',
			pageName: '',
			webLink: '',
			pageLogo: null,
			showAlert: false,
			alertMessage: ''
		};
	}
	/*--------------------------------------------------------------------------------*/
	/*To open NAVBAR in MOBILE VIEW                                                   */
	/*--------------------------------------------------------------------------------*/
	toggle() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}
	/*--------------------------------------------------------------------------------*/
	/*To open SIDEBAR-MENU in MOBILE VIEW                                             */
	/*--------------------------------------------------------------------------------*/
	showMobilemenu() {
		document.getElementById('main-wrapper').classList.toggle('show-sidebar');
	}

	handleLogout() {
		auth.signOut()
	}

	handleNewPageButton() {
		this.setState({
			addNewPageModalOpen: true
		});
	}

	closeNewPageModal() {
		this.setState({
			pageLogo: null,
			addNewPageModalOpen: false
		})
	}

	closeEditProfilePictureModal() {
		this.setState({
			profilePicture: null,
			editprofileModalOpen: false
		})
	}

	async handleProfileSubmit(e) {
		e.preventDefault()
		const updatedAt = Date.now()
		this.setState({progressing: true})
		const {profileUserName: name, profilePassword1, profilePicture} = this.state
		var photoUrl = ''
		const fileName = name + '_' + updatedAt + '_' + this.pictureName
		if (profilePicture) {
			const res = await fetch(profilePicture)
			const blob = await res.blob()
			const photoUploadData = await storage.photoUpload(blob, fileName)
			if (photoUploadData.error) {
				this.setState({
					progressing: false,
					showAlert: true,
					alertMessage: photoUploadData.error.message
				})
				setTimeout(() => {
					this.setState({ showAlert: false, alertMessage: '', pageLogo: null,  addNewPageModalOpen: false})
				}, 10000);
				return
			}
			photoUrl = photoUploadData.downloadUrl
		}
		const profile = {}
		if (photoUrl) {
			profile.photoUrl = photoUrl
		}
		if (name) {
			profile.name = name
		}
		console.log(profile)
		if (db.updateProfile(this.props.authReducer.id, profile)) {
			const user = this.props.authReducer
			this.props.signin(user.id, name, user.email, photoUrl)
		}
		this.setState({progressing: false,
			profilePicture: null,
			editprofileModalOpen: false
		})
	}

	async handleCreatePage(e) {
		e.preventDefault()
		const createdAt = Date.now()
		const {pageLogo, pageName: name, webLink: link} = this.state
		this.setState({progressing: true})
		var downloadUrl = ''
		const fileName = name + '_' + createdAt + '_' + this.pictureName
		if (pageLogo) {
			const res = await fetch(pageLogo)
			const blob = await res.blob()
			const photoUploadData = await storage.photoUpload(blob, fileName)
			if (photoUploadData.error) {
				this.setState({
					progressing: false,
					showAlert: true,
					alertMessage: photoUploadData.error.message
				})
				setTimeout(() => {
					this.setState({ showAlert: false, alertMessage: '', pageLogo: null,  addNewPageModalOpen: false})
				}, 10000);
				return
			}
			downloadUrl = photoUploadData.downloadUrl
		}
		const business = {
			ownerID: this.props.authReducer.id,
			name,
			link,
			email: this.props.authReducer.email,
			logo: 'images/'+fileName,
			downloadUrl,
			createdAt,
			updatedAt: createdAt

		}
		const businessResult = await db.createBusiness(business)
		if (businessResult.error) {
			this.setState({
				progressing: false,
				showAlert: true,
				alertMessage: businessResult.error.message
			})
			setTimeout(() => {
				this.setState({ showAlert: false, alertMessage: '', pageLogo: null,  addNewPageModalOpen: false})
			}, 10000);
			return
		}
		const businessArray = this.props.businessReducer
		businessArray.unshift({...business, role: 'owner', folderArray: [], followingCount: 1, memberCount: 1, members: [], noteArray: []})
		this.props.setBusiness([...businessArray])
		// const businessData = await db.getBusinessWithUser(this.props.authReducer.id)
		// if (businessData.error) {
		// 	this.setState({ progressing: false, showAlert: true, alertMessage: 'Getting user info error.' })
		// 	setTimeout(() => {
		// 		this.setState({ showAlert: false, alertMessage: '' })
		// 	}, 10000);
		// 	return
		// }
		// this.setState({ progressing: false })
		// if (businessData.businessArray && businessData.businessArray.length > 0) {
		// 	this.props.setBusiness(businessData.businessArray)
		// }
		this.setState({
			progressing: false,
			pageLogo: null,
			addNewPageModalOpen: false
		})
	}

	async searchBusiness() {
		const businessName = $("#searchbusiness").val();
		this.setState({ progressing: true })
		const businessData = await db.getBusinessWithName(this.props.authReducer.id, businessName)
		if (businessData.businessArray) {
			this.props.setBusiness(businessData.businessArray)
		}
		this.setState({ progressing: false })
	}

	async enterPressed(event) {
		var code = event.keyCode || event.which;
		if (code === 13) {
			await this.searchBusiness()
		}
	}

	handleProfilePicture(image) {
		this.setState({profilePicture: image})
	}

	handleChangePageName(e) {
		const pageName = e.target.value
		if (pageName) {
			e.target.setCustomValidity('')
		} else {
			e.target.setCustomValidity('Page name is required!')
		}
		this.setState({pageName})
	}

	handleCropPagelogo(image) {
		this.setState({pageLogo: image})
	}

	handleChangeWebLink(e) {
		const webLink = e.target.value
		if (webLink) {
			e.target.setCustomValidity('')
		} else {
			e.target.setCustomValidity('WebsiteLink is required!')
		}
		this.setState({webLink})
	}

	pictureFileLoad(file) {
		this.pictureName = file.name
	}

	render() {
		return (
			<header className="topbar navbarbg" >
				<Container className='container-fluid'>
					<Navbar className={"top-navbar"} expand="md">
						<div className="navbar-header" id="logobg">
							{/*--------------------------------------------------------------------------------*/}
							{/* Mobile View Toggler  [visible only after 768px screen]                         */}
							{/*--------------------------------------------------------------------------------*/}
							<span className="nav-toggler d-block d-md-none" onClick={this.showMobilemenu}>
								<i className="ti-menu ti-close" />
							</span>
							{/*--------------------------------------------------------------------------------*/}
							{/* Logos Or Icon will be goes here for Light Layout && Dark Layout                */}
							{/*--------------------------------------------------------------------------------*/}
							<NavbarBrand href="/">
								{/* <b className="logo-icon">
								<img src={logodarkicon} alt="homepage" className="dark-logo" />
								<img
									src={logolighticon}
									alt="homepage"
									className="light-logo"
								/>
							</b> */}
								<span className="logo-text">
									{/* <img src={logodarktext} alt="homepage" className="dark-logo" /> */}
									{/* <img
									src={sharedpageLogo}
									className="light-logo"
									alt="homepage"
									width='30'
									height='30'
								/> */}
									<b className="light-logo">SharedPage</b>
								</span>
							</NavbarBrand>
							{/*--------------------------------------------------------------------------------*/}
							{/* Mobile View Toggler  [visible only after 768px screen]                         */}
							{/*--------------------------------------------------------------------------------*/}
							<span className="topbartoggler d-block d-md-none" onClick={this.toggle}>
								<i className="ti-more" />
							</span>
						</div>
						{
							this.props.authReducer.id &&
							<>
								<Input
									type="search"
									style={{ width: '20%' }}
									id='searchbusiness'
									placeholder="Search Pages.... "
									onKeyPress={this.enterPressed.bind(this)}
								/>
								<IconButton color='inherit' onClick={this.searchBusiness.bind(this)}>
									<SearchIcon />
								</IconButton>
							</>
						}
						<Collapse className="navbarbg" isOpen={this.state.isOpen} navbar >
							{/* <Nav className="float-left" navbar>
							<NavItem>
								<NavLink href="/pages" className="d-none d-md-block">
									Pages
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink href="/notification" className="d-none d-md-block">
									Notification
								</NavLink>
							</NavItem>
						</Nav> */}
							<Nav className="ml-auto float-right" navbar>
								<NavItem>
									{
										this.props.authReducer.id &&
										<NavLink href="#" className="d-none d-md-block" onClick={this.handleNewPageButton.bind(this)}>
											<i className="fas fa-plus mr-1"></i>
											Create Page
									</NavLink>
									}
								</NavItem>
								{/*--------------------------------------------------------------------------------*/}
								{/* Start Notifications Dropdown                                                   */}
								{/*--------------------------------------------------------------------------------*/}
								{/* <UncontrolledDropdown nav inNavbar>
								<DropdownToggle nav caret>
									<i className="mdi mdi-bell font-24" />
								</DropdownToggle>
								<DropdownMenu right className="mailbox">
									<span className="with-arrow">
										<span className="bg-info" />
									</span>
									<div className="d-flex no-block align-items-center p-3 bg-info text-white mb-2">
										<div className="">
											<h4 className="mb-0">4 New</h4>
											<p className="mb-0">Notifications</p>
										</div>
									</div>
									<div className="message-center notifications">
										{data.notifications.map((notification, index) => {
											return (
												<span href="" className="message-item" key={index}>
													<span className={"btn btn-circle btn-" + notification.iconbg}>
														<i className={notification.iconclass} />
													</span>
													<div className="mail-contnet">
														<h5 className="message-title">{notification.title}</h5>
														<span className="mail-desc">
															{notification.desc}
														</span>
														<span className="time">{notification.time}</span>
													</div>
												</span>
											);
										})}
									</div>
									<a className="nav-link text-center mb-1 text-dark" href=";">
										<strong>Check all notifications</strong>{' '}
										<i className="fa fa-angle-right" />
									</a>
								</DropdownMenu>
							</UncontrolledDropdown> */}

								{/*--------------------------------------------------------------------------------*/}
								{/* End Notifications Dropdown                                                     */}
								{/*--------------------------------------------------------------------------------*/}
								{/*--------------------------------------------------------------------------------*/}
								{/* Start Messages Dropdown                                                        */}
								{/*--------------------------------------------------------------------------------*/}
								{/* <UncontrolledDropdown nav inNavbar>
								<DropdownToggle nav caret>
									<i className="font-24 mdi mdi-comment-processing" />
								</DropdownToggle>
								<DropdownMenu right className="mailbox">
									<span className="with-arrow">
										<span className="bg-danger" />
									</span>
									<div className="d-flex no-block align-items-center p-3 bg-danger text-white mb-2">
										<div className="">
											<h4 className="mb-0">5 New</h4>
											<p className="mb-0">Messages</p>
										</div>
									</div>
									<div className="message-center message-body">
										{data.messages.map((message, index) => {
											return (
												<span href="" className="message-item" key={index}>
													<span className="user-img">
														<img src=
															{message.image}
															alt="user"
															className="rounded-circle"
															width=""
														/>
														<span className={"profile-status pull-right " + message.status}></span>
													</span>
													<div className="mail-contnet">
														<h5 className="message-title">{message.title}</h5>
														<span className="mail-desc">{message.desc}</span>
														<span className="time">{message.time}</span>
													</div>
												</span>
											);
										})}
									</div>
									<span className="nav-link text-center link text-dark" href="">
										<b>See all e-Mails</b> <i className="fa fa-angle-right" />
									</span>
								</DropdownMenu>
							</UncontrolledDropdown> */}
								{/*--------------------------------------------------------------------------------*/}
								{/* End Messages Dropdown                                                          */}
								{/*--------------------------------------------------------------------------------*/}
								{/*--------------------------------------------------------------------------------*/}
								{/* Start Profile Dropdown                                                         */}
								{/*--------------------------------------------------------------------------------*/}
								<UncontrolledDropdown nav inNavbar>
									<DropdownToggle nav caret className="pro-pic">
										<img
											src={this.props.authReducer.photoUrl || profilephoto}
											alt="user"
											className="rounded-circle"
											width="31"
										/>
									</DropdownToggle>
									<DropdownMenu right className="user-dd">
										<span className="with-arrow">
											<span className="bg-primary" />
										</span>
										<div className="d-flex no-block align-items-center p-3  text-white mb-2" style={{ backgroundColor: "#379c3a" }}>
											<div className="">
												<img
													src={this.props.authReducer.photoUrl || profilephoto}
													alt="user"
													className="rounded-circle"
													width="60"
												/>
											</div>
											<div className="ml-2">
												<h4 className="mb-0">{this.props.authReducer.name}</h4>
												<p className=" mb-0">{this.props.authReducer.email}</p>
											</div>
										</div>
										<DropdownItem>
											<NavLink href="#" style={{ color: "black" }} onClick={() => this.setState({ editprofileModalOpen: true })}>
												<i className="ti-user mr-1 ml-1" /> Edit Profile
										</NavLink>

										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem>
											<NavLink href="#" style={{ color: "black" }}>
												<i className="ti-email mr-1 ml-1" /> Rate App
										</NavLink>
										</DropdownItem>
										<DropdownItem>
											<NavLink href="/profile" style={{ color: "black" }}>
												<i className="ti-settings mr-1 ml-1" /> SharedPage Help
										</NavLink>
										</DropdownItem>
										<DropdownItem>
											<NavLink href="#" style={{ color: "black" }}>
												<i className="ti-settings mr-1 ml-1" /> Version 2.3.2
										</NavLink>
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem>
											<NavLink href="#" style={{ color: "black" }} onClick={this.handleLogout.bind(this)}>
												<i className="fa fa-power-off mr-1 ml-1" /> Logout
										</NavLink>
										</DropdownItem>
										<DropdownItem divider />
									</DropdownMenu>
								</UncontrolledDropdown>
								{/*--------------------------------------------------------------------------------*/}
								{/* End Profile Dropdown                                                           */}
								{/*--------------------------------------------------------------------------------*/}
							</Nav>
						</Collapse>
					</Navbar>
					<Modal
						isOpen={this.state.addNewPageModalOpen}
						toggle={this.closeNewPageModal.bind(this)}
						className={this.props.className}
					>
						<ModalHeader toggle={this.closeNewPageModal.bind(this)}>
							Create New Page
                  		</ModalHeader>
						  <form onSubmit={this.handleCreatePage.bind(this)}>
						<ModalBody>

							<Row className="justify-content-center">
								{/* <img src={img1} alt="user" width="120" className="rounded-circle" />
                        		<input type="file"  style={{display:"none"}}/> */}
								<Avatar
									width={200}
									height={150}
									onCrop={this.handleCropPagelogo.bind(this)}
									src={this.state.pageLogo}
									label="Page Logo"
									onFileLoad={this.pictureFileLoad.bind(this)}
								/>
							</Row>


							<Row style={{ padding: "5px 20px" }}>
								<label className="control-label"> Page Name</label>
								<Input 
									style={{ width: "100%" }}
									value={this.state.pageName}
									className="form-control"
									required
									onChange={this.handleChangePageName.bind(this)}
								/>
							</Row>

							<Row style={{ padding: "5px 20px" }}>
								<label className="control-label">Website Link</label>
								<Input
									style={{ width: "100%" }}
									value={this.state.webLink}
									required
									onChange={this.handleChangeWebLink.bind(this)}
									className="form-control"
								/>
							</Row>

						</ModalBody>
						<ModalFooter>
							<Button color="success" type='submit' style={{ width: "100px" }}>
								Create
                    		 </Button>
							<Button color="secondary" onClick={this.closeNewPageModal.bind(this)} style={{ width: "100px" }}>
								Cancel
                     		</Button>
						</ModalFooter>
						</form>
					</Modal>
					<Modal centered isOpen={this.state.progressing} size='sm'>
						<ModalBody>
							<Loader
								type="Bars"
								visible={true}
								style={{ display: 'inline', marginRight: '10px' }}
								height={50}
								width={50}
							/>
							<span className="ml-2">Please wait...</span>
						</ModalBody>
					</Modal>
					<Modal
						isOpen={this.state.editprofileModalOpen}
						toggle={() => this.setState({ editprofileModalOpen: false })}
						className={this.props.className}
					>
						<ModalHeader toggle={() => this.setState({ editprofileModalOpen: false })}>
							Edit Profile
                  		</ModalHeader>
						<form onSubmit={this.handleProfileSubmit.bind(this)}>
						<ModalBody>

							<Row className="justify-content-center">
								{/* <img src={img1} alt="user" width="120" className="rounded-circle" />
                        		<input type="file"  style={{display:"none"}}/> */}
								<Avatar
									width={200}
									height={150}
									onCrop={this.handleProfilePicture.bind(this)}
									src={this.state.profilePicture ? this.state.profilePicture : (this.props.authReducer.photoUrl || profilephoto)}
									// img={this.state.profilePicture ? this.state.profilePicture : (this.props.authReducer.photoUrl || profilephoto)}
									
								/>
							</Row>


							<Row style={{ padding: "5px 20px" }}>
								<label className="control-label"> User Name</label>
								<input
									style={{ width: "100%" }}
									ref={this.newBusinessRef}
									value={this.state.profileUserName ? this.state.profileUserName : this.props.authReducer.name}
									onChange={(e) => this.setState({ profileUserName: e.target.value.trim() })}
									className="form-control"
								/>
							</Row>

							<Row style={{ padding: "5px 20px" }}>
								<label className="control-label">Password</label>
								<Input
									type='password'
									style={{ width: "100%" }}
									value={this.state.profilePassword1}
									id='password1'
									onChange={(e) => this.setState({ profilePassword1: e.target.value })}
									className="form-control"
								/>
							</Row>

							<Row style={{ padding: "5px 20px" }}>
								<label className="control-label">Confirm Password</label>
								<Input
									type='password'
									id='password2'
									value={this.state.profilePassword2}
									style={{ width: "100%" }}
									onChange={(e) => {
										const password2 = e.target.value
										if (this.state.profilePassword1 || password2) {
											if (this.state.profilePassword1 !== password2) {
												e.target.setCustomValidity("Passwords Don't Match")
											} else {
												e.target.setCustomValidity("")
											}
										}
										this.setState({ profilePassword2: password2 })
									}}
									className="form-control"
								/>
							</Row>
						</ModalBody>
						<ModalFooter>
							<Button color="success" type='submit' style={{ width: "100px" }}>
								Save
                     		</Button>
							<Button color="secondary" onClick={() => this.setState({ editprofileModalOpen: false })} style={{ width: "100px" }}>
								Cancel
                     		</Button>
						</ModalFooter>
						</form>
					</Modal>
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						open={this.state.showAlert}
						ContentProps={{
							'aria-describedby': 'message-id',
						}}
						variant="error"
						message={<span id="message-id">{this.state.alertMessage}</span>}
						action={[
							<IconButton
								color="primary"
								key="close"
								aria-label="Close"
								color="inherit"
								onClick={this.onDismissAlert}
							>
								<CloseIcon />
							</IconButton>,
						]}
					/>
				</Container>
			</header>
		);
	}
}

const mapStateToProps = state => {
	return {
		authReducer: state.authReducer,
		businessReducer: state.businessReducer
	}
}

export default connect(mapStateToProps, { signin, setBusiness })(Header);
