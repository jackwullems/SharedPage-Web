import React from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { SalesSummary, EmailCampaign, ActiveVisitors, Stats, Projects, RecentComment, Chat }
	from '../../components/dashboard/';

import img1 from '../../assets/images/users/1.jpg';
import img4 from '../../assets/images/users/4.jpg';
import img5 from '../../assets/images/users/5.jpg';

class Classic extends React.Component {
	render() {
		return (
			<div>
				<Row>
					<Col xs={12}>
						<SalesSummary />
					</Col>
				</Row>
				<Row>
					<Col md="8">
						<EmailCampaign />
					</Col>
					<Col md="4">
						<ActiveVisitors />
					</Col>
				</Row>
				<Stats />
				<Projects />
				<Row>
					<Col lg={6}>
						<Card>
							<CardBody>
								<CardTitle>Recent Comments</CardTitle>
							</CardBody>
							<div className="comment-widgets scrollable" style={{ height: '560px' }}>
								<PerfectScrollbar>
									<RecentComment
										image={img1}
										badge="Pending"
										badgeColor="primary"
										name="James Anderson"
										comment="Lorem Ipsum is simply dummy text of the printing and type setting industry."
										date="April 14, 2016"
									/>
									<RecentComment
										image={img4}
										badge="Approved"
										badgeColor="success"
										name="Michael Jorden"
										comment="Lorem Ipsum is simply dummy text of the printing and type setting industry."
										date="April 14, 2016"
									/>
									<RecentComment
										image={img5}
										badge="Rejected"
										badgeColor="danger"
										name="Johnathan Doeting"
										comment="Lorem Ipsum is simply dummy text of the printing and type setting industry."
										date="April 14, 2016"
									/>
									<RecentComment
										image={img1}
										badge="Pending"
										badgeColor="primary"
										name="James Anderson"
										comment="Lorem Ipsum is simply dummy text of the printing and type setting industry."
										date="April 14, 2016"
									/>
									<RecentComment
										image={img4}
										badge="Approved"
										badgeColor="success"
										name="Michael Jorden"
										comment="Lorem Ipsum is simply dummy text of the printing and type setting industry."
										date="April 14, 2016"
									/>
								</PerfectScrollbar>
							</div>
						</Card>
					</Col>
					<Col lg={6}>
						<Chat />
					</Col>
				</Row>
			</div>
		);
	}
}

export default Classic;
