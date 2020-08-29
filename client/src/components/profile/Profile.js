import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Spinner from '../layout/Spinner'
import { connect } from 'react-redux'
import { getProfileById } from '../../actions/profile'

const Profile = ({
    getProfileById,
    profile: { profile, loading },
    auth,
    match
}) => {
    useEffect(() => {
        getProfileById(match.params.id)
    }, [getProfileById])

    return (
        <Fragment>
            {profile === null || loading ? (
                <Spinner />
                ) : (
                <Fragment>
                    <Link to="/profiles" class="btn btn-light">Back to Profiles</Link>
                    {auth.isAuthenticated && auth.loading === false && auth.user._id === profile.user._id && 
                    (<Link to="/edit-profile" class="btn btn-dark">Edit profile</Link>)}
                </Fragment>
            )
            }
        </Fragment>
    )
}

Profile.propTypes = {
    profile: PropTypes.object.isRequired,
    getProfileById: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})

export default connect(mapStateToProps, { getProfileById })(Profile)
