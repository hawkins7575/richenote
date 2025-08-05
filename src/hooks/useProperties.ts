// ============================================================================
// 매물 관리 커스텀 훅
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { getProperties, getPropertyStats, createProperty, updateProperty, deleteProperty, updatePropertyStatus } from '@/services'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'

export const useProperties = (filters?: SimplePropertyFilters) => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!tenant?.id) {
      console.log('⏳ 테넌트 정보 대기 중...')
      setLoading(false)
      setError(null)
      setProperties([])
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 매물 데이터 로딩 중... (테넌트:', tenant.name, ')')
      
      // 실제 서비스 함수 호출
      const data = await getProperties(tenant.id, filters)
      
      console.log('✅ 실제 데이터 로딩 성공:', data)
      setProperties((data as Property[]) || [])
    } catch (err) {
      console.error('❌ 데이터 로딩 실패:', err)
      setError('매물을 불러오는 중 오류가 발생했습니다.')
      // 에러 발생시 빈 배열로 설정
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const createNewProperty = useCallback(async (propertyData: CreatePropertyData) => {
    console.log('🔧 useProperties.createNewProperty 시작')
    console.log('🔑 인증 정보 확인:', { 
      tenant_id: tenant?.id, 
      user_id: user?.id,
      tenant_name: tenant?.name,
      user_email: user?.email 
    })
    
    // 인증 정보 대기 시간 추가
    if (!tenant?.id) {
      console.error('❌ 테넌트 정보 없음. 3초 대기 후 재시도...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      if (!tenant?.id) {
        throw new Error('테넌트 정보를 불러올 수 없습니다. 페이지를 새로고침 해주세요.')
      }
    }
    
    if (!user?.id) {
      console.error('❌ 사용자 정보 없음. 3초 대기 후 재시도...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      if (!user?.id) {
        throw new Error('사용자 인증 정보가 없습니다. 다시 로그인 해주세요.')
      }
    }

    try {
      console.log('📞 propertyService.createProperty 호출 중...')
      console.log('📊 전달할 데이터:', propertyData)
      console.log('🏢 테넌트 ID:', tenant.id)
      console.log('👤 사용자 ID:', user.id)
      
      const newProperty = await createProperty(propertyData, tenant.id, user.id)
      console.log('✅ propertyService.createProperty 성공:', newProperty)
      
      console.log('🔄 로컬 상태 업데이트 중...')
      setProperties(prev => {
        console.log('📊 이전 매물 개수:', prev.length)
        const updated = [newProperty, ...prev]
        console.log('📊 업데이트된 매물 개수:', updated.length)
        return updated
      })
      
      console.log('✅ useProperties.createNewProperty 완료')
      return newProperty
    } catch (err) {
      console.error('❌ useProperties.createNewProperty 실패:', err)
      console.error('❌ 에러 타입:', typeof err)
      console.error('❌ 에러 상세:', err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : err)
      
      // 더 구체적인 에러 메시지 제공
      if (err instanceof Error) {
        throw err // 원본 에러 메시지 사용
      } else {
        throw new Error('매물 생성 중 알 수 없는 오류가 발생했습니다.')
      }
    }
  }, [tenant?.id, user?.id])

  const updateExistingProperty = useCallback(async (propertyId: string, propertyData: UpdatePropertyData) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      const updatedProperty = await updateProperty(propertyId, propertyData, tenant.id)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p).filter((p): p is Property => p !== null)
      )
      return updatedProperty
    } catch (err) {
      console.error('Error updating property:', err)
      throw new Error('매물 수정 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  const deleteExistingProperty = useCallback(async (propertyId: string) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      await deleteProperty(propertyId, tenant.id)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (err) {
      console.error('Error deleting property:', err)
      throw new Error('매물 삭제 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  const updateStatus = useCallback(async (propertyId: string, status: Property['status']) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      const updatedProperty = await updatePropertyStatus(propertyId, status, tenant.id)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p).filter((p): p is Property => p !== null)
      )
      return updatedProperty
    } catch (err) {
      console.error('Error updating property status:', err)
      throw new Error('매물 상태 변경 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  return {
    properties,
    loading,
    error,
    refreshProperties: fetchProperties,
    createProperty: createNewProperty,
    updateProperty: updateExistingProperty,
    deleteProperty: deleteExistingProperty,
    updatePropertyStatus: updateStatus,
  }
}

export const usePropertyStats = () => {
  const { tenant } = useTenant()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!tenant?.id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getPropertyStats(tenant.id)
        setStats(data)
      } catch (err) {
        console.error('Error fetching property stats:', err)
        setError('통계를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tenant?.id])

  return { stats, loading, error }
}