import streamlit as st
from auth import get_sign_in_url

def login_button():
    """Render a Microsoft login button"""
    sign_in_url = get_sign_in_url()
    # CHANGED: Use link_button for direct navigation
    return st.link_button("Sign in with Microsoft", sign_in_url)

def auth_required(page_title="Restricted Page"):
    """Check if user is authenticated, if not show login prompt"""
    if "user" not in st.session_state:
        st.warning("Please sign in to access this page")
        
        col1, col2 = st.columns([1, 3])
        with col1:
            login_button()
        with col2:
            st.write("You need to be logged in to access this feature")
            
        st.stop()
    return True

def user_info_card():
    """Display user information in a card format"""
    if "user" in st.session_state:
        with st.container():
            st.subheader("User Profile")
            st.write(f"**Email:** {st.session_state['user']}")
            st.write(f"**ID:** {st.session_state['user_id'][:8]}...")
            
            if st.button("Sign Out", key="signout_profile"):
                for key in list(st.session_state.keys()):
                    del st.session_state[key]
                st.rerun()