import React from 'react';
import {
	Row, Col, Card,
	CardBody,
	CardColumns,
	CardHeader,
	Button,
	Badge,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Label,
	Input,
	Form,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	CardTitle,
} from 'reactstrap';
import sharedPageUserImage from '../../assets/images/users/user.png';
import $ from 'jquery';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import classnames from 'classnames';
import { auth } from '../../firebase/firebase'
import * as db from '../../firebase/db'
import * as storage from '../../firebase/storage'
import { signin } from '../../redux/auth/action'
import { setBusiness, setNoteArray, setPrivateNoteArray, followBusiness, changeBusinessRole, changeMemberRole } from '../../redux/business/action'
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Divider from '@material-ui/core/Divider'
import SearchIcon from '@material-ui/icons/Search'
import ImageUploader from "react-images-upload"
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
	fixedLeft: {
		[theme.breakpoints.down('sm')]: {
			position: 'relative'
		},
		[theme.breakpoints.up('sm')]: {
			position: 'fixed',
			top: 70,
			overflow: 'auto',
			bottom: 70,
			width: '26%',
			left: '7%',
		},
	},
	centerContent: {
		[theme.breakpoints.up('sm')]: {
			top: 50,
			overflow: 'auto',
			marginBottom: 70,
			maxWidth: '31%',
			left: '33%',
		},
	},
	fixedRight: {
		[theme.breakpoints.down('sm')]: {
			position: 'relative'
		},
		[theme.breakpoints.up('sm')]: {
			position: 'fixed',
			top: 70,
			overflow: 'auto',
			bottom: 70,
			width: '26%',
			left: '63%',
		},
	}
})


const SortableItem = sortableElement(({ value, index, role, ownerID, businessFolderIndex, handleEditNote, handleRemoveNote, handleAddFolderNote }) => {
	return (
		<Card>
			<CardHeader>
				{
					businessFolderIndex >= 0
						?
						<div style={{ textAlign: 'right' }}>
							<a href='#' className="btn btn-circle btn-sm" onClick={() => handleEditNote(index)}> <i className="fas fa-edit"></i></a>
							<a href='#' className="btn btn-circle btn-sm" onClick={() => handleRemoveNote(index)}> <i className="fas fa-minus"></i></a>
							<a href='#' className="btn btn-circle btn-sm" onClick={() => handleAddFolderNote(index)}> <i className="fas fa-plus"></i></a>
						</div>
						:
						<Row>
							<div className="col-md-2 col-sm-2">
								<img src={value.ownerPhoto || sharedPageUserImage} alt="user" width="45" className="rounded-circle" />
							</div>
							<div className="col-md-6 col-sm-6" style={{ fontSize: "14px", fontWeight: "700", lineHeight: 3 }}>
								<label className="control-label" >{value.ownerName}</label>
							</div>
							<div className="col-md-4 col-sm-4" style={{ textAlign: "right", lineHeight: 3 }}>
								{
									<div>
										{
											value.ownerID === ownerID &&
											<a href='#' className="btn btn-circle btn-sm" onClick={() => handleEditNote(index)}> <i className="fas fa-edit"></i></a>
										}
										{
											(value.ownerID === ownerID || role === 'owner') &&
											<a href='#' className="btn btn-circle btn-sm" onClick={() => handleRemoveNote(index)}> <i className="fas fa-minus"></i></a>
										}
									</div>
								}
							</div>
						</Row>
				}
			</CardHeader>
			<CardBody>
				<Row>
					<h4 className="text-center w-100" style={{ color: 'black' }}>{value.title}</h4>
					<div style={{ padding: "10px" }}>
						<p className="ml-2" style={{ textAlign: "justify", fontSize: "14px", fontWeight: "600", color: 'black' }}>
							{value.content}
						</p>
					</div>
				</Row>
				<Row style={{ justifyContent: "center" }}>
					{value.image === "" ? "" : <img src={value.photoUrl} width='100%' className="thumbnail"></img>}
				</Row>

			</CardBody>
		</Card>
	)
});

const SortableContainer = sortableContainer(({ children }) => {
	return <CardColumns style={{ columnCount: 1 }}>{children}</CardColumns>
});

class Pages extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newFolderModalOpen: false,
			newFolderName: '',
			editFolderModalOpen: false,
			editFolderName: '',

			newNoteModalOpen: false,
			editNoteModalOpen: false,
			editNoteTitle: '',
			editNoteContent: '',
			removeNoteModalOpen: false,
			removeFolderModalOpen: false,
			searchedPages: [],
			activeMemberTab: '1',
			editNoteIndex: 0,
			showAlert: false,
			alertMessage: '',
			progressing: false,
			selectedBusinessIndex: 0,
			openedBusinessIndex: 0,
			businessFolderIndex: {},
			filterMemString: ''
		}
		this.selectedNoteIndex = null
		this.selectedFolderIndex = null
		this.picture = null

		this.onDismissAlert = this.onDismissAlert.bind(this)
	}

	onDismissAlert() {
		this.setState({ showAlert: false, alertMessage: '' })
	}

	handleCreateFolder() {
		this.setState({
			newFolderModalOpen: true
		})
	}

	handleEditFolder(selectedFolderIndex) {
		const { selectedBusinessIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folder = business.folderArray[selectedFolderIndex]
		this.selectedFolderIndex = selectedFolderIndex
		this.setState({
			editFolderModalOpen: true,
			editFolderName: folder.name,
		})
	}

	closeNewFolder() {
		this.setState({
			newFolderModalOpen: false
		})
	}

	closeEditFolder() {
		this.setState({
			editFolderModalOpen: false
		})
	}

	errAlert(error) {
		this.setState({
			progressing: false,
			showAlert: true,
			alertMessage: error.message
		})
		setTimeout(() => {
			this.setState({ showAlert: false, alertMessage: '' })
		}, 10000);
		return

	}
	async addNewFolder(e) {
		e.preventDefault()
		this.setState({ newFolderModalOpen: false, progressing: true })
		const { newFolderName, selectedBusinessIndex } = this.state
		const createdAt = Date.now()
		const business = this.props.businessReducer[selectedBusinessIndex]
		const data = await db.createFolder(this.props.authReducer.id, business.id, createdAt, newFolderName)
		if (data.error) {
			this.errAlert(data.error)
			return

		}
		const { businessReducer } = this.props
		businessReducer[selectedBusinessIndex].folderArray.unshift(data.folder)
		this.props.setBusiness(businessReducer)
		this.setState({ progressing: false })
	}

	async editFolder(e) {
		e.preventDefault()
		this.setState({ editFolderModalOpen: false, progressing: true })
		const { editFolderName, selectedBusinessIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folder = business.folderArray[this.selectedFolderIndex]
		const data = await db.editFolder(folder.id, editFolderName)
		if (data.error) {
			this.errAlert(data.error)
			return

		}
		const { businessReducer } = this.props
		businessReducer[selectedBusinessIndex].folderArray[this.selectedFolderIndex].name = editFolderName
		this.props.setBusiness(businessReducer)
		this.setState({ progressing: false })

	}


	showNewNoteModal() {
		this.setState({
			newNoteModalOpen: true
		})
	}

	closeNewNoteModal() {
		this.setState({
			newNoteModalOpen: false
		})
	}

	handleEditNoteContent(e) {
		this.setState({ editNoteContent: e.target.value })
	}

	handleEditNoteTile(e) {
		this.setState({ editNoteTitle: e.target.value })
	}

	closeEditNoteModal() {
		this.setState({
			editNoteModalOpen: false
		})
	}

	async addNewNote(e) {
		e.preventDefault()
		this.setState({ progressing: true, newNoteModalOpen: false })
		const { selectedBusinessIndex, businessFolderIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folderIndex = businessFolderIndex[selectedBusinessIndex]
		const newTitle = $("#newNoteTitle").val();
		const newContent = $("#newNoteContent").val() || '';
		const createdAt = Date.now()
		var photoUrl = ''
		if (this.picture) {
			const fileName = newTitle + '_' + createdAt + '_' + this.picture.name
			const photoUploadData = await storage.photoUpload(this.picture, fileName)
			if (photoUploadData.error) {
				this.selectedNoteIndex = null
				this.picture = null
				this.errAlert(photoUploadData.error)
				return
			}
			photoUrl = photoUploadData.downloadUrl
		}
		var noteData
		const note = {
			ownerID: this.props.authReducer.id,
			ownerName: this.props.authReducer.name,
			ownerPhoto: this.props.authReducer.photoUrl?this.props.authReducer.photoUrl:'',
			updaterID: this.props.authReducer.id,
			createdAt,
			updatedAt: createdAt,
			title: newTitle,
			content: newContent,
			photoUrl
		}
		if (folderIndex >= 0) {
			const folder = business.folderArray[folderIndex]
			const order = this.selectedNoteIndex > 0 ? (folder.noteArray[this.selectedNoteIndex - 1].order + (folder.noteArray[this.selectedNoteIndex - 1].order / folder.noteArray[this.selectedNoteIndex].order) / 2) : (this.selectedNoteIndex === 0 ? folder.noteArray[0] / 2 : 50000000)
			note.order = order
			noteData = await db.folderNoteUploadServer(
				this.props.authReducer.id,
				business.id,
				folder.id,
				note
			)
			if (noteData.error) {
				this.selectedNoteIndex = null
				this.picture = null
				this.errAlert(noteData.error)
				return
			}
			this.props.businessReducer[selectedBusinessIndex].folderArray[folderIndex].noteArray.splice(this.selectedNoteIndex, 0, note)

		} else {
			noteData = await db.businessNoteUploadServer(this.props.businessReducer[selectedBusinessIndex].id, note)
			if (noteData.error) {
				this.picture = null
				this.errAlert(noteData.error)
				return
			}
			this.props.businessReducer[selectedBusinessIndex].noteArray.unshift(note)
		}
		this.setState({ progressing: false })
	}

	async saveEditNote(e) {
		e.preventDefault()
		this.setState({ editNoteModalOpen: false, progressing: true })
		const newTitle = this.state.editNoteTitle.trim()
		const newContent = this.state.editNoteContent.trim()
		const updatedAt = Date.now()
		const { selectedBusinessIndex, businessFolderIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folderIndex = businessFolderIndex[selectedBusinessIndex]
		var photoUrl = ''
		if (this.picture) {
			const fileName = newTitle + '_' + updatedAt + '_' + this.picture.name
			const photoUploadData = await storage.photoUpload(this.picture, fileName)
			if (photoUploadData.error) {
				this.selectedNoteIndex = null
				this.picture = null
				this.errAlert(photoUploadData.error)
				return
			}
			photoUrl = photoUploadData.downloadUrl
		}
		if (folderIndex >= 0) {
			const folder = business.folderArray[folderIndex]
			const note = folder.noteArray[this.selectedNoteIndex]
			note.updaterID = this.props.authReducer.id
			note.updatedAt = updatedAt
			note.title = newTitle
			note.content = newContent
			note.photoUrl = photoUrl
			const noteData = await db.folderNoteUpdateServer(folder.id, note)
			if (noteData.error) {
				this.selectedNoteIndex = null
				this.picture = null
				this.errAlert(noteData.error)
				return
			}
			this.props.businessReducer[selectedBusinessIndex].folderArray[folderIndex].noteArray[this.selectedNoteIndex] = note
		} else {
			const note = folderIndex >= 0 ? business.folderArray[folderIndex].noteArray[this.selectedNoteIndex] : business.noteArray[this.selectedNoteIndex]
			note.updaterID = this.props.authReducer.id
			note.updatedAt = updatedAt
			note.title = newTitle
			note.content = newContent
			note.photoUrl = photoUrl
			const noteData = await db.businessNoteUpdateServer(
				this.props.businessReducer[selectedBusinessIndex].id,
				note
			)
			if (noteData.error) {
				this.picture = null
				this.errAlert(noteData.error)
				return
			}
			this.props.businessReducer[selectedBusinessIndex].noteArray[this.selectedNoteIndex] = note
		}
		this.selectedNoteIndex = null
		this.picture = null
		this.setState({
			progressing: false,
		})
	}

	onSortEnd = async ({ oldIndex, newIndex }) => {
		if (oldIndex == newIndex) {
			return
		}
		const { businessFolderIndex, selectedBusinessIndex } = this.state
		const folderIndex = businessFolderIndex[selectedBusinessIndex]
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folder = business.folderArray[folderIndex]
		var prevOrder
		var nextOrder
		var order
		if (newIndex === 0) {
			order = folder.noteArray[0].order / 2
		} else if (newIndex === (folder.noteArray.length - 1)) {
			order = folder.noteArray[folder.noteArray.length - 1].order + (100000000 - folder.noteArray[folder.noteArray.length - 1].order) / 2
		} else if (newIndex < oldIndex) {
			prevOrder = folder.noteArray[newIndex - 1].order
			nextOrder = folder.noteArray[newIndex].order
			order = prevOrder + (nextOrder - prevOrder) / 2
		} else {
			prevOrder = folder.noteArray[newIndex].order
			nextOrder = folder.noteArray[newIndex + 1].order
			order = prevOrder + (nextOrder - prevOrder) / 2
		}
		const note = folder.noteArray[oldIndex]
		note.order = order
		folder.noteArray = folder.noteArray.sort((first, second) => {
			if (first.order > second.order) {
				return 1
			}
			return -1
		})
		this.setState({ progressing: true })
		const noteData = await db.folderNoteOrderUpdateServer(this.props.authReducer.id,
			business.id,
			folder.id,
			note
		)
		if (noteData.error) {
			this.selectedNoteIndex = null
			this.picture = null
			this.errAlert(noteData.error)
			return
		}
		this.setState({ progressing: false })
	}

	async memberAccept(item) {
		this.setState({progressing: true})
		const business = this.props.businessReducer[this.state.selectedBusinessIndex]
		if (business && item.id) {
			const error = await db.changeBusinessRole(item.id, business.id, 'writer')
			if (error) {
				this.errAlert(error)
				return
			}
			this.props.changeMemberRole(this.state.selectedBusinessIndex, item.index, 'writer')
		}
		this.setState({progressing: false})
	
	}

	async memberDecline(item) {
		this.setState({progressing: true})
		const business = this.props.businessReducer[this.state.selectedBusinessIndex]
		if (business && item.id) {
			const error = await db.changeBusinessRole(item.id, business.id, 'declined')
			if (error) {
				this.errAlert(error)
				return
			}
			this.props.changeMemberRole(this.state.selectedBusinessIndex, item.index, 'declined')
		}
		this.setState({progressing: false})
	}

	handleFilterMember = event => {
		const filterMemString = event.target.value
		this.setState({filterMemString})
	}

	handleEditNote(selectedNoteIndex) {
		const business = this.props.businessReducer[this.state.selectedBusinessIndex]
		if (business) {
			const folderIndex = this.state.businessFolderIndex[this.state.selectedBusinessIndex]
			const note = folderIndex >= 0 ? business.folderArray[folderIndex].noteArray[selectedNoteIndex] : business.noteArray[selectedNoteIndex]
			this.selectedNoteIndex = selectedNoteIndex
			this.setState({
				editNoteModalOpen: true,
				editNoteTitle: note.title,
				editNoteContent: note.content,
				editNoteImage: note.photoUrl ? [note.photoUrl] : []
			})
		}
	}

	handleRemoveNote(selectedNoteIndex) {
		this.selectedNoteIndex = selectedNoteIndex
		this.setState({
			removeNoteModalOpen: true,
		})

	}

	handleAddFolderNote(selectedNoteIndex) {
		this.selectedNoteIndex = selectedNoteIndex
		this.setState({
			newNoteModalOpen: true,
		})
	}

	handleRemoveFolder(selectedFolderIndex) {
		this.selectedFolderIndex = selectedFolderIndex
		this.setState({
			removeFolderModalOpen: true,
		})
	}

	async removeNote() {
		this.setState({ removeNoteModalOpen: false, progressing: true })
		const selectedNoteIndex = this.selectedNoteIndex
		const { selectedBusinessIndex, businessFolderIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		const folderIndex = businessFolderIndex[selectedBusinessIndex]
		if (folderIndex >= 0) {
			const folder = business.folderArray[folderIndex]
			const note = business.folderArray[folderIndex].noteArray[selectedNoteIndex]
			const noteData = await db.folderNoteRemoveServer(
				this.props.authReducer.id,
				business.id,
				folder.id,
				note.id)
			if (noteData.error) {
				this.setState({
					progressing: false,
					showAlert: true,
					alertMessage: noteData.error.message
				})
				setTimeout(() => {
					this.setState({ showAlert: false, alertMessage: '' })
				}, 10000);
				return
			}
			this.props.businessReducer[selectedBusinessIndex].folderArray[folderIndex].noteArray.splice(selectedNoteIndex, 1)
		} else {
			const note = business.noteArray[selectedNoteIndex]
			const noteData = await db.businssNoteRemoveServer(business.id, note.id)
			if (noteData.error) {
				this.errAlert(noteData.error)
				return
			}
			this.props.businessReducer[selectedBusinessIndex].noteArray.splice(selectedNoteIndex, 1)
		}
		this.setState({ progressing: false })
	}

	async removeFolder() {
		this.setState({ removeFolderModalOpen: false, progressing: true })
		const { selectedBusinessIndex, businessFolderIndex } = this.state
		const business = this.props.businessReducer[selectedBusinessIndex]
		if (this.selectedFolderIndex >= 0) {
			const folder = business.folderArray[this.selectedFolderIndex]
			const folderData = await db.folderRemoveServer(
				this.props.authReducer.id,
				business.id,
				folder.id
			)
			if (folderData.error) {
				this.setState({
					progressing: false,
					showAlert: true,
					alertMessage: folderData.error.message
				})
				setTimeout(() => {
					this.setState({ showAlert: false, alertMessage: '' })
				}, 10000);
				return
			}
			delete businessFolderIndex[selectedBusinessIndex]
			const businessReducer = this.props.businessReducer
			businessReducer[selectedBusinessIndex].folderArray.splice(this.selectedFolderIndex, 1)
			this.props.setBusiness(businessReducer)
			this.setState({ businessFolderIndex, progressing: false })
		}
	}

	componentWillMount() {
		auth.onAuthStateChanged(auth => {
			if (auth && auth.emailVerified) {
				this.setState({ progressing: true })
				db.getUser(auth.uid, async (user, error) => {
					if (error) {
						this.setState({ progressing: false, showAlert: true, alertMessage: error.message })
						setTimeout(() => {
							this.setState({ showAlert: false, alertMessage: '' })
						}, 10000);
						return
					}
					if (user) {
						this.props.signin(user.id, user.data.name, user.data.email, user.data.photoUrl)
						const businessData = await db.getBusinessWithUser(user.id)
						if (businessData.error) {
							this.setState({ progressing: false, showAlert: true, alertMessage: 'Getting user info error.' })
							setTimeout(() => {
								this.setState({ showAlert: false, alertMessage: '' })
							}, 10000);
							return
						}
						this.setState({ progressing: false })
						if (businessData.businessArray && businessData.businessArray.length > 0) {
							this.props.setBusiness(businessData.businessArray)
							return
						}
					} else {
						this.setState({ progressing: false, showAlert: true, alertMessage: 'Getting user info error.' })
						setTimeout(() => {
							this.setState({ showAlert: false, alertMessage: '' })
						}, 10000);
						return
					}
				})
			} else {
				this.props.history.replace('/login')
			}
		})
	}

	async handleSelectPage(index, isExpanded) {
		const businessFolderIndex = this.state.businessFolderIndex
		if (!isExpanded) {
			delete businessFolderIndex[index]
			this.setState({
				openedBusinessIndex: null,
				businessFolderIndex,
				newNoteModalOpen: false,
				editNoteModalOpen: false,
				removeNoteModalOpen: false
			})
			return
		}
		const findex = businessFolderIndex[index]
		if (findex >= 0) {
			await this.handleActiveFolder(index, findex)
		} else {
			const selectedNoteArray = this.props.businessReducer[index].noteArray
			if (selectedNoteArray) {
				this.setState({
					selectedBusinessIndex: index,
					openedBusinessIndex: index,
					newNoteModalOpen: false,
					editNoteModalOpen: false,
					removeNoteModalOpen: false
				})
			} else {
				const noteData = await db.getBusinessNotes(this.props.businessReducer[index].id)
				if (noteData.error) {
					this.setState({
						progressing: false,
						showAlert: true,
						alertMessage: 'Getting note error!',
						newNoteModalOpen: false,
						editNoteModalOpen: false,
						removeNoteModalOpen: false
					})
					setTimeout(() => {
						this.setState({ showAlert: false, alertMessage: '' })
					}, 10000);
					return
				}
				const noteArray = noteData.noteArray
				if (noteArray) {
					this.props.setNoteArray(noteArray, index)
					this.setState({
						selectedBusinessIndex: index,
						openedBusinessIndex: index,
						newNoteModalOpen: false,
						editNoteModalOpen: false,
						removeNoteModalOpen: false
					})
				}
			}

		}
	}

	async handleActiveFolder(bindex, index) {
		const business = this.props.businessReducer[bindex]
		if (business) {
			const folder = business.folderArray[index]
			if (folder) {
				const businessFolderIndex = this.state.businessFolderIndex
				const noteArray = folder.noteArray
				if (noteArray) {
					businessFolderIndex[bindex] = index
					this.setState({
						selectedBusinessIndex: bindex,
						openedBusinessIndex: bindex,
						businessFolderIndex,
						newNoteModalOpen: false,
						editNoteModalOpen: false,
						removeNoteModalOpen: false
					})
				} else {
					const noteData = await db.getBusinessFolderNotes(this.props.authReducer.id, business.id, folder.id)
					if (noteData.error) {
						this.setState({
							progressing: false,
							showAlert: true,
							alertMessage: 'Getting note error!',
							newNoteModalOpen: false,
							editNoteModalOpen: false,
							removeNoteModalOpen: false
						})
						setTimeout(() => {
							this.setState({ showAlert: false, alertMessage: '' })
						}, 10000);
						return

					}
					const noteArray = noteData.noteArray
					if (noteArray) {
						this.props.setPrivateNoteArray(noteArray, bindex, index)
						businessFolderIndex[bindex] = index
						this.setState({
							selectedBusinessIndex: bindex,
							openedBusinessIndex: bindex,
							businessFolderIndex,
							newNoteModalOpen: false,
							editNoteModalOpen: false,
							removeNoteModalOpen: false,
							removeFolderModalOpen: false
						})
					}
				}
			}
		}
	}

	async handleClickFolder(index) {
		await this.handleActiveFolder(this.state.selectedBusinessIndex, index)
	}

	onDrop(pictureFiles, pictureDataURLs) {
		if (pictureFiles.length > 0) {
			this.picture = pictureFiles[0]
			return
		}
		this.picture = null
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.businessReducer.length !== this.props.businessReducer.length) {
			this.selectedNoteIndex = null
			this.selectedFolderIndex = null
			this.setState({selectedBusinessIndex: 0, openedBusinessIndex: 0, businessFolderIndex: {}})
		}
	}

	toggleFollow(e) {
		e.preventDefault()
		const {selectedBusinessIndex} = this.state
		const selectedBusiness = this.props.businessReducer[selectedBusinessIndex]
		const userID = this.props.authReducer.id
		this.setState({progressing: true})
		if (db.followBusiness(userID, selectedBusiness.id)) {
			this.setState({progressing: false})
			this.props.changeBusinessRole(selectedBusinessIndex, 'subscription')
		}
	}

	async changeBusinessRole(role) {
		const {selectedBusinessIndex} = this.state
		const selectedBusiness = this.props.businessReducer[selectedBusinessIndex]
		const userID = this.props.authReducer.id
		this.setState({progressing: true})
		const error = await db.changeBusinessRole(userID, selectedBusiness.id, role)
		if (error) {
			this.errAlert(error)
			return
		}
		this.props.changeBusinessRole(selectedBusinessIndex, role)
		this.setState({progressing: false})
	}

	async toggleSendMemberRequest(e) {
		e.preventDefault()
		await this.changeBusinessRole('candidate')
	}

	async toggleCancelMemberRequest(e) {
		e.preventDefault()
		await this.changeBusinessRole('subscription')
	}

	toggleUnfollow(e) {
		e.preventDefault()
		e.preventDefault()
		const {selectedBusinessIndex} = this.state
		const selectedBusiness = this.props.businessReducer[selectedBusinessIndex]
		const userID = this.props.authReducer.id
		this.setState({progressing: true})
		if (db.unfollowBusiness(userID, selectedBusiness.id)) {
			this.setState({progressing: false})
			this.props.changeBusinessRole(selectedBusinessIndex, '')
		}
	}

	render() {
		const { classes } = this.props
		const selectedBusiness = this.props.businessReducer[this.state.selectedBusinessIndex]
		const businessFolderIndex = this.state.businessFolderIndex[this.state.selectedBusinessIndex]
		var selectedNoteArray = []
		var sortDisabled = true
		var members = []
		var businessButtons = null
		var selectedFolder = null
		if (selectedBusiness) {
			if (this.state.openedBusinessIndex >= 0 && businessFolderIndex >= 0) {
				selectedFolder = selectedBusiness.folderArray[businessFolderIndex]
				selectedNoteArray = selectedFolder.noteArray || []
				sortDisabled = false
			} else {
				selectedNoteArray = selectedBusiness.noteArray || []
			}
			members = selectedBusiness.members
			switch (selectedBusiness.role) {
				case 'candidate':
					businessButtons = (
						<Col>
							<Button variant="contained" style={{marginRight: 10}} color="secondary" onClick={this.toggleCancelMemberRequest.bind(this)}>
								Cancel Member Request
							</Button>
							<Button variant="contained" color="secondary" onClick={this.toggleUnfollow.bind(this)}>
								Unfollow
							</Button>
						</Col>
	
					)
					break
				case 'subscription':
				case 'declined':
					businessButtons = (
						<Col>
							<Button variant="contained" style={{marginRight: 10}} color="primary" onClick={this.toggleSendMemberRequest.bind(this)}>
								Send Member Request
							</Button>
							<Button variant="contained" color="secondary" onClick={this.toggleUnfollow.bind(this)}>
								Unfollow
							</Button>
						</Col>
	
					)
					break
				case 'writer':
					businessButtons = (
						<Col>
							<Button variant="contained" color="secondary" onClick={this.toggleUnfollow.bind(this)}>
								Unfollow
							</Button>
						</Col>
	
					)
					break
				case 'owner':
					businessButtons = (
						<Col>
						{
							// <Button variant="contained" color='secondary' onClick={()=>{}}>
							// 	Remove
							// </Button>
						}
						</Col>
	
					)
					break
				default:
					businessButtons = (
						<Col>
						{
							<Button variant="contained" color="primary" onClick={this.toggleFollow.bind(this)}>
								Follow
							</Button>
						}
						</Col>
	
					)
					break
			}
		}
		return (
			<div>
				{selectedBusiness &&
				<Row sm={12}>
					<Col lg={{ size: 4, order: 1 }} sm={{ size: 12, order: 1 }} className={classes.fixedLeft} >
						<Row className='pages'>
							<label className="control-label col-sm-10 col-md-10 col-lg-10" style={{ padding: "15px 0px 2px 10px", fontWeight: "700", textTransform: "uppercase" }}>Pages</label>
							{
								this.props.businessReducer.map((business, bindex) => {
									return (
										<ExpansionPanel key={business.id} expanded={this.state.openedBusinessIndex === bindex} style={{ width: '100%', backgroundColor: this.state.selectedBusinessIndex === bindex ? '#eef5f9' : '#fff' }}
											onChange={(event, isExpanded) => this.handleSelectPage(bindex, isExpanded)}
										>
											<ExpansionPanelSummary
												expandIcon={<ExpandMoreIcon />}
												aria-controls="panel1bh-content"
												id="panel1bh-header"
											>
												<Col>
													<img src={business.downloadUrl || sharedPageUserImage} alt="user" width="45" height='45' className="rounded-circle" />
													<span style={{ fontWeight: "700", fontSize: "16px", marginLeft: 10 }}>{business.name}</span>
												</Col>
											</ExpansionPanelSummary>
											<Divider />
											<ExpansionPanelDetails style={{ flexDirection: 'column' }}>
												<List>
													{
														business.folderArray.map((folder, findex) => {
															return (
																<ListItem button divider key={folder.id}
																	selected={bindex === this.state.selectedBusinessIndex && findex === this.state.businessFolderIndex[this.state.selectedBusinessIndex] ? true : false}
																	onClick={() => {
																		this.handleClickFolder(findex)
																	}}>
																	<ListItemText primary={folder.name} />
																	<ListItemSecondaryAction>
																		<IconButton edge="end" aria-label="Edit"
																			onClick={() => {
																				this.handleEditFolder(findex)
																			}}>
																			<EditIcon />
																		</IconButton>
																		<IconButton edge="end" aria-label="Delete"
																			onClick={() => {
																				this.handleRemoveFolder(findex)
																			}}>
																			<DeleteIcon />
																		</IconButton>
																	</ListItemSecondaryAction>
																</ListItem>
															)
														})
													}
												</List>
												<Row>
												{businessButtons}
												</Row>
											</ExpansionPanelDetails>
										</ExpansionPanel>
									)
								})}
						</Row>
					</Col>
					<Col lg={{ size: 4, order: 2 }} sm={{ size: 12, order: 3 }} className={classes.centerContent}>
						{
							selectedNoteArray.length > 0 ?
								<SortableContainer onSortEnd={this.onSortEnd.bind(this)} >

									{selectedNoteArray.map((note, index) => {
										return (
											<SortableItem
												key={`item-${index}`}
												index={index}
												value={note}
												role={selectedBusiness.role}
												disabled={sortDisabled}
												ownerID={this.props.authReducer.id}
												businessFolderIndex={this.state.businessFolderIndex[this.state.selectedBusinessIndex]}
												handleEditNote={this.handleEditNote.bind(this)}
												handleRemoveNote={this.handleRemoveNote.bind(this)}
												handleAddFolderNote={this.handleAddFolderNote.bind(this)}
												/>
										)
									})}

								</SortableContainer>
								:
								<Card>
									<CardBody style={{ padding: 0, paddingLeft: "40px" }}>
										<Row className="p-2 mt-3">
											{/* {
                                 selectedBusiness && (selectedBusiness.role === 'writer' || selectedBusiness.role === 'owner') &&
                                 <button className="mr-2 btn btn-success" onClick={this.showNewNoteModal.bind(this)}><i className="fas fa-plus"></i>
                                 New Note
                                 </button>
                              } */}
										</Row>
									</CardBody>
								</Card>
						}
					</Col>
					<Col lg={{ size: 4, order: 3 }} sm={{ size: 12, order: 2 }} className={classes.fixedRight}>
						<Card>
							<Row className='p-2 mt-2 mb-2'>
								<Col className="text-right" sm="3">
									<button className="mr-2 btn btn-success" disabled={selectedBusiness.role==='writer'||selectedBusiness.role==='owner'||selectedFolder?false:true} onClick={this.showNewNoteModal.bind(this)}><i className="fas fa-plus"></i>
										New Note
									</button>
								</Col>
								<Col className="text-right" sm="3">
									<button className="mr-2 btn btn-success" disabled={selectedBusiness.role?false:true} onClick={this.handleCreateFolder.bind(this)}><i className="fas fa-plus"></i>
										New Folder
								</button>
								</Col>
							</Row>
						</Card>
						<Card >
							<CardBody style={{ padding: 0, paddingLeft: "40px" }}>
								<Row className="mr-0">
									<Col className="p-2" md="1" sm="2" lg="2" >
										<img src={(selectedBusiness.downloadUrl) || sharedPageUserImage} alt="user" width="45" height='45' className="rounded-circle" />
										<label>{selectedBusiness.role==='owner'?'owner':selectedBusiness.role==='writer'?'member':(selectedBusiness.role==='subscription'||selectedBusiness.role==='declined'||selectedBusiness.role==='candidate')?'subscription':''}</label>
									</Col>
									<Col className="p-2 text-center" md="6" lg="10" sm="10">
										<Row className="mt-3">
											<Col md="4" lg="4" sm="4">
												<Badge color="success" pill style={{ fontSize: "16px" }}> {(selectedBusiness.noteArray && selectedBusiness.noteArray.length) || '0'} </Badge>
												<label className="ml-2">Note</label>
											</Col>
											<Col md="4" lg="4" sm="4">
												<Badge color="info" pill style={{ fontSize: "16px" }}> {(selectedBusiness.noteArray && selectedBusiness.members.length) || '0'} </Badge>
												<label className="ml-2">Member</label>
											</Col>
											<Col md="4" lg="4" sm="4">
												<Badge color="danger" pill style={{ fontSize: "16px" }}> {(selectedBusiness.noteArray && selectedBusiness.followingCount) || '0'} </Badge>
												<label className="ml-2">Follower</label>
											</Col>
										</Row>
									</Col>

								</Row>
								<Row className="mb-2">
									<span>{selectedBusiness.link}</span>
								</Row>
							</CardBody>
						</Card>
						<Card style={{ marginTop: "10px" }}>
							<CardHeader>
								<Row style={{ alignItems: 'center' }}>
									<Input
										type="search"
										style={{ width: '70%' }}
										id='search'
										name='search'
										placeholder="Search Members..."
										inputprops={{ 'aria-label': 'Search Members...' }}
										onChange={this.handleFilterMember}
									/>
									<IconButton>
										<SearchIcon />
									</IconButton>
								</Row>
							</CardHeader>
							<CardBody>
								<CardTitle>Members</CardTitle>
								<Row>
									{
										selectedBusiness.role === 'owner' &&
										<Nav tabs>
											<NavItem>
												<NavLink
													className={classnames({ active: this.state.activeMemberTab === '1' })}
													onClick={() => {
														this.setState({ activeMemberTab: '1' })
													}}
												>
													All
                                    			</NavLink>
											</NavItem>
											<NavItem>
												<NavLink
													className={classnames({ active: this.state.activeMemberTab === '2' })}
													onClick={() => {
														this.setState({ activeMemberTab: '2' })
													}}
												>
													Request
                                    			</NavLink>
											</NavItem>
											<NavItem>
												<NavLink
													className={classnames({ active: this.state.activeMemberTab === '3' })}
													onClick={() => {
														this.setState({ activeMemberTab: '3' })
													}}
												>
													Member
                                    			</NavLink>
											</NavItem>
										</Nav>
									}
									<TabContent activeTab={this.state.activeMemberTab} className="w-100 p-2">
										<TabPane tabId="1">
											{
												members.filter(item=>{
													if (this.state.filterMemString) {
														if (item.name.toLowerCase().includes(this.state.filterMemString.toLowerCase())) {
															return true
														}
														return false
													}
													return true
												}).map((item, member_index) => {
												return (
													<Col key={member_index}>
														<Row>
															<Col sm="4" md="6" lg="6">
																<label>
																	<img src={item.photoUrl || sharedPageUserImage} width="40" className="rounded-circle d-inline" />
																	<span className="ml-2">{item.name}</span>
																</label>
															</Col>
															<Col sm="8" md="6" lg="6">
																<Row className="float-right mr-2 mt-1">

																	<Button
																		// outline
																		color="success"
																		size="sm"
																		className="mr-2"
																		onClick={()=>this.memberAccept(item)}
																		style={{ display: item.role === 'candidate' ? "block" : "none" }}
																	>
																		ACCEPT
                                                					</Button>
																	<Button
																		outline
																		color="success"
																		size="sm"
																		className="mr-2"
																		onClick={()=>this.memberDecline(item)}
																		style={{ display: item.role === 'candidate' ? "block" : "none" }}
																	>
																		DECLINE
                                                					</Button>
																</Row>
															</Col>
														</Row>
														<Row>
															<Divider style={{ width: '100%' }} />
														</Row>
													</Col>
												)
											})}

										</TabPane>
										<TabPane tabId="2">
											{
												members.filter(item => {
													if (item.role === 'candidate') {
														if (this.state.filterMemString) {
															if (item.name.toLowerCase().includes(this.state.filterMemString.toLowerCase())) {
																return true
															}
															return false
														}
														return true
													}
													return false
												}).map((item, member_index) => {
													return (
														<Col key={member_index}>
															<Row>
																<Col sm="4" md="6" lg="6">
																	<label>
																		<img src={item.photoUrl || sharedPageUserImage} width="40" className="rounded-circle d-inline" />
																		<span className="ml-2">{item.name}</span>
																	</label>
																</Col>
																<Col sm="8" md="6" lg="6">
																	<Row className="float-right mr-2 mt-1">

																		<Button
																			outline
																			color="success"
																			size="sm"
																			className="mr-2"
																			onClick={()=>this.memberAccept(item)}
																			style={{ display: item.role === 'candidate' ? "block" : "none" }}
																		>
																			ACCEPT
																		</Button>
																		<Button
																			outline
																			color="success"
																			size="sm"
																			className="mr-2"
																			onClick={()=>this.memberDecline(item)}
																			style={{ display: item.role === 'candidate' ? "block" : "none" }}
																		>
																			DECLINE
																		</Button>
																	</Row>
																</Col>
															</Row>
															<Row>
																<Divider style={{ width: '100%' }} />
															</Row>
														</Col>)
												})}
										</TabPane>
										<TabPane tabId="3">
											{
												members.filter(item => {
													if (item.role === 'owner' || item.role === 'writer') {
														if (this.state.filterMemString) {
															if (item.name.toLowerCase().includes(this.state.filterMemString.toLowerCase())) {
																return true
															}
															return false
														}
														return true
													}
													return false
												}).map((item, member_index) => {
													return (
														<Col key={member_index}>
														<Row>
														<Col sm="4" md="6" lg="6">
															<label>
																<img src={item.photoUrl || sharedPageUserImage} width="40" className="rounded-circle d-inline" />
																<span className="ml-2">{item.name}</span>
															</label>
														</Col>
														<Col sm="8" md="6" lg="6">
															<Row className="float-right mr-2 mt-1">

																<Button
																	outline
																	color="success"
																	size="sm"
																	className="mr-2"
																	onClick={()=>this.memberDecline(item)}
																	style={{ display: item.role != 'owner' ? "block" : "none" }}
																>
																	REMOVE
                                            					 </Button>
															</Row>
														</Col>

													</Row>
													<Row>
														<Divider style={{ width: '100%' }} />
													</Row>
													</Col> )
												})}
										</TabPane>
									</TabContent>
								</Row>
							</CardBody>
						</Card>
					</Col>
					<Modal
						isOpen={this.state.newFolderModalOpen}
					>
						<ModalHeader>
							<label style={{ width: "100%" }}>New Folder</label>
						</ModalHeader>
						<Form
							onSubmit={e => {
								this.addNewFolder(e)
							}}
						>
							<ModalBody>
								<label style={{ width: "100%" }}> Enter subject </label>
								<Input
									style={{ width: "100%" }}
									className="form-control"
									onChange={e => {
										this.setState({ newFolderName: e.target.value })
									}}
								/>
							</ModalBody>
							<ModalFooter>
								<Button color="success" type='submit' style={{ width: "100px" }}>
									OK
                    			</Button>
								<Button color="secondary" onClick={this.closeNewFolder.bind(this)} style={{ width: "100px" }}>
									Cancel
                    			</Button>
							</ModalFooter>
						</Form>
					</Modal>

					<Modal
						isOpen={this.state.editFolderModalOpen}
					>
						<ModalHeader>
							<label style={{ width: "100%" }}>Edit Folder</label>
						</ModalHeader>
						<Form
							onSubmit={e => {
								this.editFolder(e)
							}}
						>
							<ModalBody>
								<label style={{ width: "100%" }}> Enter subject </label>
								<Input
									style={{ width: "100%" }}
									className="form-control"
									onChange={e => {
										this.setState({ editFolderName: e.target.value })
									}}
									value={this.state.editFolderName}
								/>
							</ModalBody>
							<ModalFooter>
								<Button color="success" type='submit' style={{ width: "100px" }}>
									OK
                    			</Button>
								<Button color="secondary" onClick={this.closeEditFolder.bind(this)} style={{ width: "100px" }}>
									Cancel
                    			</Button>
							</ModalFooter>
						</Form>
					</Modal>

					<Modal
						isOpen={this.state.newNoteModalOpen}
					>
						<ModalHeader toggle={this.closeNewNoteModal.bind(this)}>
							Add New Note
                		</ModalHeader>
						<Form
							onSubmit={this.addNewNote.bind(this)}
						>
							<ModalBody>
								<Label className="control-label">Note Title</Label>
								<Input
									style={{ width: "100%" }}
									required
									id="newNoteTitle"
									className="form-control"
									autoComplete="off"
								/>
								<Label className="control-label">Content</Label>
								<Input type="textarea" id="newNoteContent" autoComplete="off" />
								<Row className="justify-content-center">
									<ImageUploader
										withLabel={false}
										withIcon={false}
										withPreview={true}
										singleImage={true}
										onChange={this.onDrop.bind(this)}
										imgExtension={[".jpg", ".png"]}
									/>
								</Row>
							</ModalBody>
							<ModalFooter>
								<Button color="success" type='submit' style={{ width: "100px" }}>
									New Note
                    			</Button>
								<Button color="secondary" onClick={this.closeNewNoteModal.bind(this)} style={{ width: "100px" }}>
									Cancel
                    			</Button>
							</ModalFooter>
						</Form>
					</Modal>

					<Modal
						isOpen={this.state.editNoteModalOpen}
					>
						<ModalHeader toggle={this.closeEditNoteModal.bind(this)}>
							Edit Note
                		</ModalHeader>
						<Form
							onSubmit={this.saveEditNote.bind(this)}
						>
							<ModalBody>
								<Label className="control-label">Note Title</Label>
								<Input
									style={{ width: "100%" }}
									required
									className="form-control"
									autoComplete="off"
									value={this.state.editNoteTitle}
									onChange={(e) => this.handleEditNoteTile(e)}
								/>
								<Label className="control-label">Content</Label>
								<Input type="textarea" autoComplete="off"
									value={this.state.editNoteContent}
									onChange={(e) => this.handleEditNoteContent(e)}
								/>
								<Row className="justify-content-center">
									<ImageUploader
										defaultImages={this.state.editNoteImage}
										withLabel={false}
										withIcon={false}
										withPreview={true}
										singleImage={true}
										onChange={this.onDrop.bind(this)}
										imgExtension={[".jpg", ".png"]}
									/>
								</Row>
							</ModalBody>
							<ModalFooter>
								<Button color="success" type='submit' style={{ width: "100px" }}>
									Save Note
                    			</Button>
								<Button color="secondary" onClick={this.closeEditNoteModal.bind(this)} style={{ width: "100px" }}>
									Cancel
                    			</Button>
							</ModalFooter>
						</Form>
					</Modal>

					<Modal
						isOpen={this.state.removeNoteModalOpen}
						fade={false}
					>
						<ModalHeader toggle={() => this.setState({ removeNoteModalOpen: false })}>
							Are you sure to remove this Note?
                		</ModalHeader>
						<ModalFooter>
							<Button color="success" onClick={this.removeNote.bind(this)} style={{ width: "100px" }}>
								Yes
                     </Button>
							<Button color="secondary" onClick={() => this.setState({ removeNoteModalOpen: false })} style={{ width: "100px" }}>
								Cancel
                     </Button>
						</ModalFooter>
					</Modal>

					<Modal
						isOpen={this.state.removeFolderModalOpen}
						fade={false}
					>
						<ModalHeader toggle={() => this.setState({ removeFolderModalOpen: false })}>
							Are you sure to remove this Folder and Notes in there?
                  		</ModalHeader>
						<ModalFooter>
							<Button color="success" onClick={this.removeFolder.bind(this)} style={{ width: "100px" }}>
								Yes
                     		</Button>
							<Button color="secondary" onClick={() => this.setState({ removeFolderModalOpen: false })} style={{ width: "100px" }}>
								Cancel
                     		</Button>
						</ModalFooter>
					</Modal>
				</Row>
				}
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
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		authReducer: state.authReducer,
		businessReducer: state.businessReducer
	}
}

export default connect(mapStateToProps, { signin, setBusiness, setNoteArray, setPrivateNoteArray, followBusiness, changeBusinessRole, changeMemberRole })(withStyles(styles)(Pages));