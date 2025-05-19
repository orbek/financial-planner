import streamlit as st
from auth import get_sign_in_url

def render_sidebar():
    """Render a consistent sidebar for navigation"""
    
    with st.sidebar:
        # Authentication status
        if "user" in st.session_state:
            st.success(f"Welcome, {st.session_state['user']}!")
            
            # Profile section
            with st.expander("👤 Profile"):
                st.write(f"**Email:** {st.session_state['user']}")
                if st.button("Sign Out"):
                    for key in list(st.session_state.keys()):
                        del st.session_state[key]
                    st.rerun()
            
            st.divider()
            
            # When logged in, we can add custom navigation links
            # beyond the auto-generated page links
            st.subheader("Quick Links")
            col1, col2 = st.columns(2)
            with col1:
                st.page_link("app.py", label="Home", icon="🏠")
            with col2:
                st.page_link("pages/4_dashboard.py", label="Dashboard", icon="📊")
                
        else:
            # Login section
            st.subheader("Sign In")
            sign_in_url = get_sign_in_url()
            
            # CHANGED: Use link_button instead of button with JavaScript
            st.link_button("Sign in with Microsoft", sign_in_url)
            
        # Footer - always appears
        st.sidebar.divider()
        st.sidebar.caption("© 2025 Financial Planner")