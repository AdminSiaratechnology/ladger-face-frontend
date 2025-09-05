import React from 'react'

export const demoCredential = () => {
  return (
     <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Demo Credentials:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{cred.role}</div>
                    <div className="text-gray-600">{cred.email}</div>
                    <div className="text-gray-600">{cred.password}</div>
                  </div>
                ))}
              </div>
            </div>
  )
}
